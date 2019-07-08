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



