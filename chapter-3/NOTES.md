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
- Code Example

## Working with arguments
Sometimes it's required to work with a variable number of arguments. Using the express operator is possible to do something like this:

```
function listArguments2(...args) {
    console.log(args);
}
```
All arguments form the function are inside the `args` array:

Check this example:
- Using spread operator with arguments