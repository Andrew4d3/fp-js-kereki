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
