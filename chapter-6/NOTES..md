# Producing Functions - Higher- Order Functions

Three major groups to consider:

- **Wrapped functions**: that keep their original functionility at the same time that add some new feature.
- **Altered functions**: that differ in some key point with their original versions.
- **Other productions**: that provide for new operations, turn functions into
  promises, provide enhanced search functions, or allow decoupling a method
  from objects, so we can use them in other contexts as if they were common
  functions.

## Wrapping functions

Let's consider some higher-order functions that provide a wrapper around
other function, to enhance it in some way

### Logging in a functional way

We can write a higher-order function that will have a single parameter, the original
function, and return a new function that will do the following:

1. Log the received arguments.
2. Call the original function, catching its returned value.
3. Log that value; and finally.
4. Return to the caller.

```
const addLogging = fn => (...args) => {
  console.log(`entering ${fn.name}: ${args})`);
  const valueToReturn = fn(...args);
  console.log(`exiting ${fn.name}: ${valueToReturn}`);
  return valueToReturn;
};
```

Remember a high order function is a function that returns a function. We are applying curryng over here.

Let's use our new `addLogging` wrapper:

```
function subtract(a, b) {
  b = changeSign(b);
  return a + b;
}
function changeSign(a) {
  return -a;
}
subtract = addLogging(subtract);

changeSign = addLogging(changeSign);
let x = subtract(7, 5);
```

The result will be:

```
entering subtract: 7 5
entering changeSign: 5
exiting changeSign: -5
exiting subtract: 2
```

#### Taking exceptions into account

What if some error happens during the function execution? Let's add some error handling to take care of those cases:

```
const addLogging2 = fn => (...args) => {
  console.log(`entering ${fn.name}: ${args}`);
  try {
    const valueToReturn = fn(...args);
    console.log(`exiting ${fn.name}: ${valueToReturn}`);
    return valueToReturn;
  } catch (thrownError) {
    console.log(`exiting ${fn.name}: threw ${thrownError}`);
    throw thrownError;
  }
};
```

#### Working in a more pure way

The `console.log` function is global to our context. So in order to make our wrapper work in a more pure way, we should inject the logger we are going to use, and set the `console.log` as the default argument.

```
const addLogging3 = (fn, logger = console.log) => (...args) => {
  logger(`entering ${fn.name}: ${args}`);
  try {
    const valueToReturn = fn(...args);
    logger(`exiting ${fn.name}: ${valueToReturn}`);
    return valueToReturn;
  } catch (thrownError) {
    logger(`exiting ${fn.name}: threw ${thrownError}`);
    throw thrownError;
  }
};
```

By doing this, we can use other alternative loggers like winston (for node.js environments)

```
const winston = require("winston");
const myLogger = t => winston.log("debug", "Logging by winston: %s", t);
winston.level = "debug";
subtract = addLogging3(subtract, myLogger);
changeSign = addLogging3(changeSign, myLogger);
let x = subtract(7, 5);

// debug: Logging by winston: entering substract: 7,5
// ...and so on
```

### Timing
