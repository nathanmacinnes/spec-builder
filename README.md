# spec-builder #

[![Build Status](https://travis-ci.org/nathanmacinnes/spec-builder.svg)](https://travis-ci.org/nathanmacinnes/spec-builder)

_Roll your own test/spec assertions syntax_

**Step 1:** Pick an awesome verb
````js
var prescribe = require("spec-builder")();
````

**Step 2:** Give it some initial assertions
````js
var prescribe = require("spec-builder")({
    "should.equal" : assert.equal,
    "should.not.equal" : assert.notEqual
});
````

**Step 3:** Add a `that` property if needed
````js
prescribe.that = prescribe;
````

**Step 4:** Start using it
````js
prescribe.that(something).should.equal(somethingElse);
````

**Step 5:** Add an `and` property
````js
prescribe.add("and");
presecribe.that(1).should.equal(1).and.should.not.equal(2);
````

**Step 6:** Add more complex assertions
````js
presecribe.add("has.a.property", function (actual, property, value, message) {
    if (arguments.length === 3) {
        message = value;
    }
    assert.ok(property in actual, message);
    if (arguments.length === 4) {
        assert.equal(actual[property], value, message);
    }
});
prescribe.that([1]).has.a.property("length")
    .and.has.a.property(0, 1);
````

**Step 7:** Export and publish
````js
module.exports = prescribe;
````

## ¿Habla español? ##

````js
var esperar = {};
esperar.que = require("spec-builder")({
    "es.egual.a" : assert.equal,
    "no.es.egual.a" : assert.notEqual
});
esperar.que.add("y");
esperar.que(1).es.egual.a(1).y.no.es.egual.a(2);
````

## License ##

The MIT License (MIT)

Copyright (c) 2014 Nathan MacInnes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
