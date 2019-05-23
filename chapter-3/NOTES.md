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
Sometimes it's required to work with a variable number of arguments. Using the express operator is possible to do something like this:

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
It won work... Instead of, do something like this:
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