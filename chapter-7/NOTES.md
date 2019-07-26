# Transforming Functions - Currying and Partial Application

## Currying
Currying consists in transform an _n-nary_ function (receives more than one parameter) into a unary function (receives only one). This could lead to some advantages when dealing with complex calculations or operations.

### Dealing with many parameters
What if we want to make a function that receives three parameters to receive only one (native type, of course). Example:

```
const make3 = (a, b, c) => String(100 * a + 10 * b + c);
```
We can transform it (applying currying) into something like this:
```
const make3curried = a => b => c => String(100 * a + 10 * b + c);
```
And in the end we would call it like this:
```
const result = make3curried(1)(2)(4);
// "124"
```
That's currying! Another example. Let's suppose we want to implment some logging function that defines a level of "severity". Without currying, you might think on doing something like this:
```
let myLog = (severity, logText) => {
// display logText in an appropriate way,
// according to its severity ("NORMAL", "WARNING", or "ERROR")
};
```
The problem with this approach is that every time you wanted to use this function, you would need to set the level of severity. If we are sending several "normal" messages, this will lead to some code repetition ( a lot of `myLog("NORMAL", "some normal text")`) but with currying we can simplify the things by doing this:
```
myLog = curry(myLog);
// replace myLog by a curried version of itself
const myNormalLog = myLog("NORMAL");
const myWarningLog = myLog("WARNING");
const myErrorLog = myLog("ERROR");

myNormalLog("This is a Normal Log");
myNormalLog("This is another Normal Log");
```

### Currying with bind()

What if we wanted to transform any non-unary function into a curried one? Basically, we want to avoid doing something like `(a) => (b) => (c) ...` any time we want to curry a function. We can implement a function that does exactly that:

```
const curryByBind = fn =>
  fn.length === 0 ? fn() : p => curryByBind(fn.bind(null, p));
```
What this function does, is to first verify if the function's arity is different from zero. If that's the case, it will call recursively the same function, sending as parameter a bound version of the initial function. The `bind` method will do three things:
1. Fix the parameter we're taking as the first argument of the new function.
2. Decrease the original function's arity in one (from 3 to 2)
3. Scrap the last argument from the original function. From (a, b, c) to (a,b).

We're going to do the same thing two times more. But this time fixing the second and third parameter and decresing the initial arity until reaching 0. This is when we're going to return the original function but with all the parameters fixed.
```
const make3 = (a, b, c) => String(100 * a + 10 * b + c);
const f1 = curryByBind(make3); // f1 is a function, that will fix make3's 1st parameter
const f2 = f1(6); // f2 is a function, that will fix make3's 2nd parameter
const f3 = f2(5); // f3 is a function, that will fix make3's last parameter
const f4 = f3(8); // "658" is calculated, since there are no more parameters to fix
```
Testing thing is very straightforward:
```
const make3 = (a, b, c) => String(100 * a + 10 * b + c);
describe("with curryByBind", function () {
    it("you fix arguments one by one", () => {
        const make3a = curryByBind(make3);
        const make3b = make3a(1)(2);
        const make3c = make3b(3);
        expect(make3c).toBe(make3(1, 2, 3));
    });
});
```
Now, what can we do if we have a variable number of parameters? Instead of relying on `fn.length` we could set the desired number of parameters initially.

```
const curryByBind2 = (fn, len = fn.length) =>
    len === 0 ? fn() : p => curryByBind2(fn.bind(null, p), len - 1);
const sum2 = (...args) => args.reduce((x, y) => x + y, 0);
sum2.length; // 0; curryByBind() wouldn't work
sum2(1, 5, 3); // 9
sum2(1, 5, 3, 7); // 16
sum2(1, 5, 3, 7, 4); // 20
curriedSum5 = curryByBind2(sum2, 5); // curriedSum5 will expect 5
parameters
curriedSum5(1)(5)(3)(7)(4); // 20
```
And testing still being a piece of cake:

```
describe("with curryByBind2", function () {
    it("you fix arguments one by one", () => {
        const suma = curryByBind2(sum2, 5);
        const sumb = suma(1)(2)(3)(4)(5);
        expect(sumb).toBe(sum(1, 2, 3, 4, 5));
    });
    it("you can also work with arity 1", () => {
        const suma = curryByBind2(sum2, 1);
        const sumb = suma(111);
        expect(sumb).toBe(sum(111));
    });
});
```

## Partial application

Currying works just fine when we require to fix parameters in order. But what if we needed to fix different parameters in different order? Here is when partial application comes handy.
Example, Let's suppose we have to use the fetch API from modern browsers, and we require to send multiple requests to different resources (URLs) as we keep the same options each time. This is what we'll do:

```
const myOptions = {
    method: "GET",
    headers: new Headers(),
    cache: "default"
};
const myFetch = partial(fetch, undefined, myOptions);
```
By passing `undefined` as second parameter, we're skipping the first argument and setting the second one. In this situation, the `undefined` argument serves the purpose of "placeholder". To indicate, that's the expected parameter to be received in a future call. Example:

```
myFetch("a/first/url").then(/* do something */).catch(/* on error */);
myFetch("a/second/url")
    .then(/* do something else */)
    .catch(/* on error */);
```
Here, we're performing `fetch` requests with a fixed second parameter (options) and always sending a different URL.

_Implementing partial application is very complex to understand so just go and use the lodash implementation._

## Partial currying

"Partial Currying" is very similar to plain "Currying". The only difference is that this time it's possible to accept more that one argument at once. Example:

```
const echoArguments = (a, b, c, d) => [a, b, c, d];

const curriedEchoArguments = partialCurry(echoArguments);

const result = curriedEchoArguments(a)(b, c)(d); // b and c being sent at the same time
```
In this case, in the second call, we're sending two parameters at the same time: `(b, c)`. We could also send the first three, first two, last three or whichever combination we want. Implementing this using only arrow function could be very difficult. Since we have to define any possible combination of arguments. But using the `bind` method is way easier.

### Partial currying with bind()

This is very similar to what we did with normal currying. The `bind` method allows to set multiple arguments at once. So we're going to rely on that feature:

```
const partialCurryingByBind = fn =>
    fn.length === 0
        ? fn()
        : (...pp) => partialCurryingByBind(fn.bind(null, ...pp));
```
And the example works as usual. This time, Notice how 6 and 5 are being sent at the same time:

```
const make3 = (a, b, c) => String(100 * a + 10 * b + c);
const f1 = partialCurryingByBind(make3);
const f2 = f1(6, 5); // f2 is a function, that fixes make3's first two arguments
const f3 = f2(8); // "658" is calculated, since there are no more parameters to fix
```
And testing is easy too:
```
const make3 = (a, b, c) => String(100 * a + 10 * b + c);
describe("with partialCurryingByBind", function () {
    it("you could fix arguments in several steps", () => {
        const make3a = partialCurryingByBind(make3);
        const make3b = make3a(1, 2);
        const make3c = make3b(3);
        expect(make3c).toBe(make3(1, 2, 3));
    });
    it("you could fix arguments in a single step", () => {
        const make3a = partialCurryingByBind(make3);
        const make3b = make3a(10, 11, 12);
        expect(make3b).toBe(make3(10, 11, 12));
    });
    it("you could fix ALL the arguments", () => {
        const make3all = partialCurryingByBind(make3);
        expect(make3all(20, 21, 22)).toBe(make3(20, 21, 22));
    });
    it("you could fix one argument at a time", () => {
        const make3one = partialCurryingByBind(make3)(30)(31)(32);
        expect(make3one).toBe(make3(30, 31, 32));
    });
});
```

## Final thoughts

### Parameter order
Sometimes we find hard to apply currying or partial aplications to some functions. Since the parameters order from the original function doesn't meet the criteria we require. That's why we need to implement some high order function that re-organizes our arguments in the way we want them.

```
const flipArgumentsOrder = (fn) => (...args) => fn(...args.reverse());

const echo = (a,b) => [a, b];
const echoInverted = flipArgumentsOrder(echo);

console.log(echoInverted(1,2)); // [2, 1]
```

_I'm not going to give a further example of this because applying partial application you can resolve this in a better way_