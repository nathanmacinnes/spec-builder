var assert = require("assert"),
    Chance = require("chance").Chance,
    injectr = require("injectr"),
    pretendr = require("pretendr");

describe("spec-builder", function () {
    var cb,
        mockInspect,
        random,
        assertionInstance;
    beforeEach(function () {
        cb = pretendr();
        mockInspect = pretendr();
        assertionInstance = injectr("../lib/spec-builder.js", {
            util : {
                inspect : mockInspect.mock
            }
        });
        random = new Chance(this.currentTest.title.charAt(0));
    });

    function randomString() {
        // make sure . character isn't included
        return random.string({
            pool : "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                "0123456789"
        });
    }

    it("returns a function", function () {
        assert.equal(typeof assertionInstance(), "function");
    });
    describe("instance", function () {
        var test;
        beforeEach(function () {
            test = assertionInstance();
        });
        describe("add method", function () {
            it("allows adding assertion methods", function () {
                var method = randomString();
                test.add(method, cb.mock);
                cb.calls.length = 0;
                test(1)[method]();
                assert.equal(cb.calls.length, 1);
            });
            it("doesn't call the method too early", function () {
                var method = randomString();
                test.add(method, cb.mock);
                assert.equal(cb.calls, 0);
            });
            it("allows adding chains", function () {
                var route = random.n(randomString, 3, {
                    pool : "abcdefghijklmnopqrstuvwxyz"
                });
                test.add(route.join("."), cb.mock);
                cb.calls.length = 0;
                test(1)[route[0]][route[1]][route[2]](1);
                assert.equal(cb.calls.length, 1);
            });
            it("passes the 'actual' value to created methods", function () {
                var method = randomString(),
                    value = {};
                test.add(method, cb.mock);
                test(value)[method]();
                assert.equal(cb.calls[0].args[0], value);
            });
            it("passes the 'expected' values to created methods", function () {
                var method = randomString(),
                    expectedArgs = random.n(randomString, random.natural({
                        min : 1,
                        max : 10
                    }));
                test.add(method, cb.mock);
                test({})[method].apply(test[method], expectedArgs);
                assert.deepEqual(
                    cb.calls[0].args.slice(1, expectedArgs.length + 1),
                    expectedArgs);
            });
            it("makes added methods return the original", function () {
                var method = randomString(),
                    t;
                test.add(method, cb.mock);
                t = test(1);
                assert.equal(t[method](), t);
            });
            it("runs added methods in context of the original", function () {
                var method = randomString(),
                    t;
                test.add(method, cb.mock);
                t = test(1);
                t[method]();
                assert.equal(cb.calls[0].context, t);
            });
            it("adds a concatenator with only a single argument", function () {
                var prop = randomString(),
                    t;
                test.add("equals", function () {});
                test.add(prop);
                t = test(1);
                assert.equal(t.equals()[prop], t);
            });
            it("leaves properties blank if no route matches", function () {
                var parts = [randomString(), randomString()];
                test.add(parts.join("."));
                assert.equal(test(10)[parts[0]], undefined);
            });
            it("allows extending an existing method", function () {
                var method1 = randomString(),
                    method2 = randomString();
                test.add(method1, function () {});
                test.add(method1 + "." + method2, cb.mock);
                test(1)[method1][method2]();
                assert.equal(cb.calls.length, 1);
            });
            describe("to display an assertion message", function () {
                var args,
                    method,
                    route,
                    val;
                beforeEach(function () {
                    args = random.n(randomString, random.natural({
                        min : 1,
                        max : 10
                    }));
                    val = randomString();
                    route = random.n(randomString, 3);
                    test.message = cb.mock;
                    cb.fake(randomString);
                    route = random.n(randomString, 3);
                    method = pretendr();
                    test.add(route.join("."), method.mock);
                    test(val)[route[0]][route[1]][route[2]].apply(null, args);
                });
                it("passes the route to .message()", function () {
                    assert.deepEqual(cb.calls[0].args[0], route);
                });
                it("passes the original value to .message()", function () {
                    assert.equal(cb.calls[0].args[1], val);
                });
                it("passes the arguments to .message()", function () {
                    assert.deepEqual(cb.calls[0].args.slice(2), args);
                });
                it("passes the result to the method", function () {
                    var methodArgs = method.calls[0].args;
                    assert.equal(methodArgs[methodArgs.length - 1],
                        cb.calls[0].returned);
                });
            });
        });
        describe("message method", function () {
            it("returns the inspect result for arg2 at the start", function () {
                var actual = randomString(),
                    call,
                    msg;
                mockInspect.fake(randomString);
                msg = test.message([], actual);
                call = mockInspect.calls.filter(function (thisCall) {
                    return thisCall.args[0] === actual;
                })[0];
                assert.equal(msg.indexOf(call.returned), 0);
            });
            it("returns comma-separated arg results at the end", function () {
                var args = random.n(randomString, random.natural({
                        min : 1,
                        max : 10
                    })),
                    joined,
                    msg;
                mockInspect.fake(randomString);
                msg = test.message.apply(null, [[]].concat(args));
                joined = mockInspect.calls.filter(function (call) {
                    // exclude args[0] as that is the "actual"
                    return call.args[0] !== args[0];
                }).map(function (call) {
                    return call.returned;
                }).join(", ");
                assert.equal(msg.indexOf(joined),
                    msg.length - joined.length);
            });
            it("returns a space-joined route in the middle", function () {
                var msg,
                    route = random.n(randomString, random.natural({
                        min : 1,
                        max : 10
                    }));
                mockInspect.returnValue("!");
                msg = test.message(route, {}, {});
                assert.equal(msg, "! " + route.join(" ") + " !");
            });
        });
    });
});
