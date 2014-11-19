"use strict";

var util = require("util");

module.exports = function (routes) {
    routes = routes || {};
    stipulate.add = addAssertion;
    stipulate.message = message;

    return stipulate;

    function addAssertion(description, fn) {
        if (fn) {
            routes[description] = fn;
            description.split(".").forEach(addWord);
            return;
        }
        description.split(".").forEach(function (part, index, arr) {
            if (index < arr.length - 1) {
                addWord(part);
                return;
            }
            addWord(part, function () {
                return this.original;
            });
        });
    }

    function addWord(word, fn) {
        if (Stipulation.prototype.hasOwnProperty(word)) {
            return;
        }

        // Allows addWord to be passed into array.forEach without causing
        // "getter must be a function" error
        if (typeof fn !== "function") {
            fn = false;
        }

        Object.defineProperty(Stipulation.prototype, word, {
            get : fn || function () {
                return new Stipulation(this.actual, this.route.concat(word),
                    this.original);
            }
        });
    }

    function message(route, actual) {
        var args;
        // doing it in this order makes the tests work
        // tests need a re-write to make this simple
        actual = util.inspect(actual);
        args = Array.prototype.slice.call(arguments, 2)
            .map(util.inspect).join(", ");
        return [actual].concat(route).concat(args).join(" ");
    }

    function stipulate(a) {
        return new Stipulation(a);
    }

    function Stipulation(base, route, original) {
        var stipulation = this;
        this.actual = base;
        this.route = route || [];
        this.original = original || this;
        Object.keys(routes).forEach(function (r) {
            var part = r.substr(r.lastIndexOf(".") + 1);

            // Don't do anything if we're not at the end of a valid route -
            // we'll just rely on the properties added to the prototype for
            // these
            if (stipulation.route.concat(part).join(".") !== r) {
                return;
            }

            // Override the words on the prototype with a function to do the
            // assertion. For some reason we can only override a defineProperty
            // with another defineProperty.
            Object.defineProperty(stipulation, part, {
                get : function () {
                    return assertionMethod;
                }
            });
            function assertionMethod() {
                var args = Array.prototype.slice.call(arguments),
                    message;
                message = stipulate.message.apply(null,
                    [r.split(".")].concat(stipulation.actual, args));
                routes[r].apply(stipulation.original,
                    [stipulation.actual].concat(args, message));
                return stipulation.original;
            }
        });
    }
};
