# Starting Out with Functions - A Core Concept

## Arrow functions - the modern way

Nothing new to learn here, just remember you can express something like this:

```
function mySum(a, b) {
    retrun a + b;
}
```

As something like this:

```
const mySum = (a, b) => a + b;
```

Which is shorter.

You can also take the `this` from the outter context, which can be useful at times. Check this example:

- [Code Example](https://github.com/Andrew4d3/fp-js-kereki/blob/master/chapter-3/arrowExample.js)

## Working with arguments

Sometimes it's required to work with a variable number of arguments. Using the spread operator is possible to do something like this:

```
function listArguments2(...args) {
    console.log(args);
}
```

All arguments form the function are inside the `args` array:

Check this example:

- [Using spread operator with arguments](https://github.com/Andrew4d3/fp-js-kereki/blob/master/chapter-3/spreadArguments.js)

## Functions as Objects

### A better redux reducer

In JS we can assign functions to variables, constants or object attributes. Example:

- [A React+Redux reducer](https://github.com/Andrew4d3/fp-js-kereki/blob/master/chapter-3/betterReducer.js)

### An unnecessary mistake

When woriking with callbacks, there's not need to make an explicit call to a different function if that's the only thing you do. Just use the function declaration as a parameter. This is called "Point Free".

- [Example using promises](https://github.com/Andrew4d3/fp-js-kereki/blob/master/chapter-3/pointFree.js)

### Working with methods

When working with object methods. Doing something like this:

```
fetch("some/remote/url").then(myObject.store);
```

It won't work... Instead of, do something like this:

```
fetch("some/remote/url").then(myObject.store.bind(myObject));
```

This is a general solution. When dealing with a method, you cannot just assign it; you must
use .bind( so the correct context will be available.

## Using functions in FP ways

### Injection - sorting it out

Let's check the `Array.prototype.sort()`method:

```
var colors = [
    "violet",
    "indigo",
    "blue",
    "green",
    "yellow",
    "orange",
    "red"
];
colors.sort();
console.log(colors);
// ["blue", "green", "indigo", "orange", "red", "violet", "yellow"]
```

But what if we want to sort word in a different way. For example, using Spanish language rules?
For such cases, we can use the `String​.prototype​.locale​Compare()` method:

```
palabras.sort((a, b) => a.localeCompare(b, "es"));
console.log(palabras);
// ["mano", "mítico", "musical", "natural", "ñandú", "oasis"]
```

**NOTE**: This is a "strategy design" example.

This is a simple example, that you have probably used before -- but it's an FP pattern, after
all.

### Continuation Passing Style

The preceding code, in which you call a function but also pass another function that is to be
executed when the input/output operation is finished, can be considered a case of CPS -
Continuation Passing Style.

You are not limited to passing a single continuation. As with promises, you can provide two
or more alternate callbacks.

```
function doSomething(a, b, c, normalContinuation, errorContinuation) {
let r = 0;
// ... do some calculations involving a, b, and c,
// and store the result in r
// if an error happens, invoke:
// errorContinuation("description of the error")
// otherwise, invoke:
// normalContinuation(r)
}
```

### Stubbing

The idea is to do stubbing, an idea from testing, which
means replacing a function with another that does a simpler job, instead of doing the actual
work.

```
let myLog;
if (DEVELOPMENT) {
    myLog = someText => console.log(someText);
} else {
    myLog = someText => {};
}
```

We can even do better with the ternary operator:

```
const myLog = DEVELOPMENT
    ? someText => console.log(someText)
    : someText => {};
```

### Immediate invocation

The pattern itself is called, as we mentioned, Immediately Invoked Function Expression --
usually simplified to IIFE, pronounced iffy. The name is easy to understand: you are
defining a function and calling it right away, so it gets executed on the spot. Why would
you do this, instead of simply writing the code inline? The reason has to do with scopes.

Let's write one of the chapter 1 examples (the counter) using Immediate invocation

```
const myCounter = (function() {
    let count = 0;
    return function() {
        count++;
        return count;
    };
})();
```

Then, every call myCounter() would return an incremented count -- but there is no chance
that any other part of your code will overwrite the inner count variable because it's only
accessible within the returned function.

**NOTE**: The biggest disavantage of doing this is that you won't be able to create a new counter.
