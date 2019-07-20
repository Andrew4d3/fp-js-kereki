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

### Timinng

What if we want to measure how long our function takes to complete? We can create a wrapper function that determines that:

```
const myPut = (text, name, tStart, tEnd) =>
    console.log(`${name} - ${text} ${tEnd - tStart} ms`);
const myGet = () => performance.now();
const addTiming = (fn, getTime = myGet, output = myPut) => (...args) => {
    let tStart = getTime();
    try {
        const valueToReturn = fn(...args);
        output("normal exit", fn.name, tStart, getTime());
        return valueToReturn;
    } catch (thrownError) {
        output("exception thrown", fn.name, tStart, getTime());
        throw thrownError;
    }
};
```

Let's use it in the substract function we already implemented:

```
subtract = addTiming(subtract);
let x = subtract(7, 5);
// subtract - normal exit 0.10500000000001819 ms
let y = subtract(4, 0);
// subtract - exception thrown 0.0949999999999136 ms
```

### Memoizing

We can use high-order wrapper functions to cache values that requires high intensive CPU operations. Example: A fibonacci function!

#### Simple memoization

This is the fibanacci function to be cached.

```
function fib(n) {
    if (n == 0) {
        return 0;
    } else if (n == 1) {
        return 1;
    } else {
        return fib(n - 2) + fib(n - 1);
    }
}
```

And this is the `memoize` function we want to apply:

```
const memoize = fn => {
    let cache = {}
    return x => (x in cache ? cache[x] : (cache[x] = fn(x)));
}
```

Let's measure (using our `addTiming` wrapper) how our `fib` function behaves without caching.

```
const testFib = n => fib(n);
addTiming(testFib)(45); // 15,382.255 ms
addTiming(testFib)(40); // 1,600.600 ms
addTiming(testFib)(35); // 146.900 ms
```

Now let's add the cache wrapper:

```
const testMemoFib = memoize(n => fib(n));
addTiming(testMemoFib)(45); // 15,537.575 ms
addTiming(testMemoFib)(45); // 0.005 ms... good!
addTiming(testMemoFib)(40); // 1,368.880 ms... recalculating?
addTiming(testMemoFib)(35); // 123.970 ms... here too?
```

Something must be wrong. We should get shorter times for the return values 40 and 35. What is happening? The problem is. We're just caching the `testMemoFib` function. We're not caching the inner `fib` call. So the 45 value we send first, is the only one being cached and nothing else.

How to resolve this? We just need to add the `memoize` function to the original `fib` function and that's it!

```
fib = memoize(fib);
addTiming(testFib)(45); // 0.080 ms
addTiming(testFib)(40); // 0.025 ms
addTiming(testFib)(35); // 0.009 ms
```

#### More complex memoization

What can we do if we have to work with a function that receives two or more arguments, or
that can receive arrays or objects as arguments? There are two approaches for this problem.

The first one is simply not doing anything! We only cache one argument functions. Like this:

```
const memoize2 = fn => {
    if (fn.length === 1) {
        let cache = {};
        return x => (x in cache ? cache[x] : (cache[x] = fn(x)));
    } else {
        return fn;
    }
};
```

The second one is a little bit more complicated. We need to find a way to create cache keys out of argument values. One way is to use the `JSON.stringify` utility:

```
const memoize3 = fn => {
    let cache = {};
    const PRIMITIVES = ["number", "string", "boolean"];
    return (...args) => {
        let strX =
            args.length === 1 && PRIMITIVES.includes(typeof args[0])
                ? args[0]
                : JSON.stringify(args);
        return strX in cache ? cache[strX] : (cache[strX] = fn(...args));
    };
};
```

If we get one single angurment and if that argument has a primitive type. We preceed as usual, otherwise we stringify it.

If we don't care about performance, we can shorten this function even further by strigifying any argument, either it has primitive type or doesn't. Like this:

```
const memoize4 = fn => {
    let cache = {};
    return (...args) => {
        let strX = JSON.stringify(args);
        return strX in cache ? cache[strX] : (cache[strX] = fn(...args));
    };
};
```

#### Memoization testing

The best way to test a memoization function is to assert the number of calls the fib function receives for different input values.

```
describe("the memoized fib", function () {
    beforeEach(() => {
        fib = memoize(fib);
    });
    it("should produce same results", () => {
        expect(fib(0)).toBe(0);
        expect(fib(1)).toBe(1);
        expect(fib(5)).toBe(5);
        expect(fib(8)).toBe(21);
        expect(fib(10)).toBe(55);
    });
    it("shouldn't repeat calculations", () => {
        spyOn(window, "fib").and.callThrough();
        expect(fib(6)).toBe(8); // 11 calls
        expect(fib).toHaveBeenCalledTimes(11);
        expect(fib(5)).toBe(5); // 1 call
        expect(fib(4)).toBe(3); // 1 call
        expect(fib(3)).toBe(2); // 1 call
        expect(fib).toHaveBeenCalledTimes(14);
    });
});
```

For this case, the first fib function is called recursively 11 times (it's not cached). But the subsecuent executions were called just once. This because the executions with `fib(5)`, `fib(4)` and `fib(3)` were already executed and respectively cached when `fib(6)`was called.

## Altering functions

Here we're going to modify what a function does.

### Doing things once, revisited

The original once function goes like this:

```
const once = func => {
    let done = false;
    return (...args) => {
        if (!done) {
            done = true;
            func(...args);
        }
    };
};
```

This implementation is OK. The only problem is the function won't return anything after the first call. What if we want to return the value from the first call, without executing the function again? We can do something like this:

```
const once2 = func => {
    let done = false;
    let result;
    return (...args) => {
        if (!done) {
            done = true;
            result = func(...args);
        }
        return result;
    };
};
```

Now, we will always return something.

We can also create a different version, where a second function is executed after the first call:

```
const onceAndAfter = (f, g) => {
    let done = false;
    return (...args) => {
        if (!done) {
            done = true;
            return f(...args);
        } else {
            return g(...args);
        }
    };
};
```

Using functions as first order objects, we can rewrite this in a shorter way by storing the function we need to execute inside a variable:

```
const onceAndAfter2 = (f, g) => {
    let toCall = f;
    return (...args) => {
        let result = toCall(...args);
        toCall = g;
        return result;
    };
};
```

This is an example. The door will "squeak" at the first call, and "creak" at the second one:

```
const squeak = (x) => console.log(x, "squeak!!");
const creak = (x) => console.log(x, "creak!!");
const makeSound = onceAndAfter2(squeak, creak);
makeSound("door"); // "door squeak!!"
makeSound("door"); // "door creak!!"
makeSound("door"); // "door creak!!"
makeSound("door"); // "door creak!!"
```

### Logically negating a function

Let's supose we want to implement the oppsite of the `filter` method. We might rewrite the predicate and that would do the work. But a fancier solution will be to create a High-order function that negates the predicate.

```
const not = fn => (...args) => !fn(...args);
```

Now we can use this function like this:

```
const isNegativeBalance = v => v.balance < 0;
// ...many lines later...
const notDelinquent3 = serviceResult.accountsData.filter(
    not(isNegativeBalance)
);
```

Another solution would be to create a new filter method, called `filterNot`. We may as well add this new method to the `Array.prototype`.

```
const filterNot = arr => fn => arr.filter(not(fn));
```

### Inverting results

In the same line of negating a function, we can also invert its results. Take the `sort` method as an example and supose we want to invert its order. Like before, we could rewrite the predicate. But using a high-order function, we can get the same result in a shorter way:

```
const spanishComparison = (a, b) => a.localeCompare(b, "es");
var palabras = ["ñandú", "oasis", "mano", "natural", "mítico", "musical"];
palabras.sort(spanishComparison);
// ["mano", "mítico", "musical", "natural", "ñandú", "oasis"]

const invert = fn => (...args) => -fn(...args);

palabras.sort(invert(spanishComparison));
// ["oasis", "ñandú", "natural", "musical", "mítico", "mano"]
```

### Arity changing

Eventually, we will have to leave with issues related to the Arity of a function in scenarios when we want to use the free point notation. Example:

```
["123.45", "-67.8", "90"].map(parseInt); // problem: parseInt isn't monadic!
// [123, NaN, NaN]
```

In this case, `parseInt` expects a second parameter (radix) other than the one `map` gives out (index). The easiest way to resolve it is by using an arrow function. But we can also implement a high-order function, that relies on the spread operator to get the same result.

```
const unary = fn => (...args) => fn(args[0]);
```

And we can use it like this:

```
["123.45", "-67.8", "90"].map(unary(parseInt));
// [123, -67, 90]
```

## Other higher-order functions

### Turning functions into promises

We might want to transform a callback style function into a promise-based one. Yes, I know there's a "promisify" utility. But if we wanted to use our own implementation, it would look like this:

```
const promisify = fn => (...args) =>
  new Promise((resolve, reject) =>
    fn(...args, (err, data) => (err ? reject(err) : resolve(data)))
  );

```

This is a high-order function that creates a new promise which result will be rejected or resolved whether we get an error or we don't.

Let's use this promisify implementation for the `fs.readFile` method.

```
const fspromise = promisify(fs.readFile.bind(fs));
const goodRead = data => console.log("SUCCESSFUL PROMISE", data);
const badRead = err => console.log("UNSUCCESSFUL PROMISE", err);
fspromise("./readme.txt") // success
  .then(goodRead)
  .catch(badRead);
fspromise("./readmenot.txt") // failure
  .then(goodRead)
  .catch(badRead);
```

Notice, how we had to bind the context to the `readFile` method. Otherwise, we might run into issues

### Getting a property from an object

As we learned, we can use map to obtain a list of values from a specific object property. But this solution may look too verbose for some people. So let's create a `getField` function that serves the same purpose.

```
const getField = attr => obj => obj[attr];

let averageLat = average(markers.map(getField("lat")));
let averageLon = average(markers.map(getField("lon")));
```

### Finding the optimum

Sometimes, we would like to find the maximun or minimum value from an array, based in some specific rules. We can create a high-order function that relies on the `reduce` method to achieve this. Like this:

```
const findOptimum2 = fn => arr => arr.reduce(fn);
```

And the example would be:

```
const findMaximum = findOptimum2((x, y) => (x > y ? x : y));
const findMinimum = findOptimum2((x, y) => (x < y ? x : y));
findMaximum(myArray); // 60
findMinimum(myArray); // 4
```

Here we're wiring the corresponding predicate for minimum or maximum values to the `reduce` function we already know.
