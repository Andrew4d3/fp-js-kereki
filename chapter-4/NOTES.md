# Behaving Properly - Pure Functions

## Pure Functions

Two main characteristics:

- Given the same arguments, the function always calculates and returns the same
  result
- When calculating its result, the function doesn't cause any observable side
  effect, including output to I/O devices, mutation of objects, change to program
  state outside of the function, and so on.

### Referential Transparency

In mathematics, Referential Transparency is the property that lets you replace an expression
with its value, and not change the results of whatever you were doing.

For example, something like this:

```
var x = 1 + 2 * 3;
```

It can be written like this:

```
var x = 1 + 6;
```

Or with this:

```
var x = 7;
```

Expressions involving I/O are
not transparent, given that their results cannot be known until they are executed. For the
same reason, expressions involving date- and time-related functions, or random numbers,
are also not transparent.

In FP, much emphasis is put upon referentially transparent functions. Not
only a compiler can reason about the program behavior (and thus be enabled to optimize
the generated code), but also the programmer can more easily reason about the program
and the relationship between its components. In turn, this can help prove the correctness of
an algorithm, or to optimize the code by replacing a function with an equivalent one.

### Side Effects

We can define those as some change in state, or some interaction with
outside elements (the user, a web service, another computer, whatever) that occurs during
the execution of some calculations or process.

#### Usual side effects

- Changing global variables.
- Mutating objects received as arguments.
- Doing any kind of I/O, such as showing an alert message or logging some text.
- Working with, and changing, the filesystem.
- Updating a database.
- Calling a web service.
- Querying or modifying the DOM.
- Triggering any external process.
- And, finally, just calling some other function that happens to produce a side
- effect of its own. You could say that impurity is contagious: a function that calls
- an impure function automatically becomes impure on its own!

#### Global State

Since pure functions, by definition,
always return the same output value given the same input arguments, if a function refers to
anything outside its internal state, it automatically becomes impure.

```
let limitYear = 1999;
const isOldEnough = birthYear => birthYear <= limitYear; // It's not pure. limitYear can change outside the scope
console.log(isOldEnough(1960)); // true
console.log(isOldEnough(2001)); // false
```

There is an exception to this rule.

```
const PI = 3.14159265358979;
const circleArea = r => PI * Math.pow(r, 2); // or PI * r ** 2
```

Even though the function is accessing an external state, the fact that PI is a constant (and
thus cannot be modified) would allow substituting it inside circleArea with no functional
change, and so we should accept that the function is pure.

#### Inner state

The notion is also extended to internal variables, in which a local state is stored, and then
used for future calls. In this case, the external state is unchanged, but there are side effects that imply future differences as to the returned values from the function.

```
const roundFix = (function() {
  let accum = 0;
  return n => {
    // reals get rounded up or down
    // depending on the sign of accum
    let nRounded = accum > 0 ? Math.ceil(n) : Math.floor(n);
    console.log("accum", accum.toFixed(5), " result", nRounded);
    accum += n - nRounded;
    return nRounded;
  };
})();

roundFix(3.14159); // accum 0.00000 result 3
roundFix(2.71828); // accum 0.14159  result 3
roundFix(2.71828); // accum -0.14013  result 2
roundFix(3.14159); // accum 0.57815  result 4 <- Same input as the first call, but different output. Not pure!
roundFix(2.71828); // accum -0.28026  result 2 <- The same

```

The JS code is [here](http://link_here).

The second calls of `roundFix(3.14159)` and `roundFix(2.71828)` got other values than the ones they got first. Thus, this function is not pure.

#### Argument mutation

For example, say you wanted a function that would find the maximum element of an array of strings

```
const maxStrings = a => a.sort().pop();
let countries = ["Argentina", "Uruguay", "Brasil", "Paraguay"];
console.log(maxStrings(countries)); // "Uruguay"
```

It seems to work, but now the original array has been modified (mutation) so if we run again:

```
console.log(countries);
// ["Argentina", "Brasil", "Paraguay"]
```

We don't get the same result. Therefore, this function is not pure. In this case, a quick solution is to work on a copy of the array

```
const maxStrings2 = a => [...a].sort().pop();
let countries = ["Argentina", "Uruguay", "Brasil", "Paraguay"];
console.log(maxStrings2(countries)); // "Uruguay"
console.log(countries); // ["Argentina", "Uruguay", "Brasil", "Paraguay"]
```

So the original `countries` array remains unaltered.

### Advantages of pure functions

The main advantage of using pure functions, derives from the fact that they don't have any
side effects. When you call a pure function, you need not worry about anything, outside of
which arguments you are passing to it.

#### Order of execution

Pure functions can be called robust. You know that their execution --in whichever
order-- won't ever have any sort of impact on the system.

#### Memoization

Since the output of a pure function for a given input is always the same, you can cache the
function results and avoid a possibly costly re-calculation. This process, which implies
evaluating an expression only the first time, and caching the result for later calls, is called memoization.

#### Self-documentation

Pure functions have another advantage. Since all the function needs to work with is given to
it through its parameters, having no kind of hidden dependency whatsoever, when you
read its source code, you have all you need to understand the function's objective.

#### Testing

Pure functions have a single responsibility, producing their output in
terms of their input. So, when you write tests for pure functions, your work is much
simplified, because there is no context to consider and no state to simulate.

## Impure Functions

Reducing side effects is a good goal in FP, but we cannot go overboard with it! So, let's
think how to avoid using impure functions, if possible, and how to deal with them if not,
looking for the best possible way to contain or limit their scope.

### Avoiding impure functions

Let's now consider how we can minimize their number, if doing away with all of them isn't really feasible.

#### Avoiding the usage of state

There's a well know way of doing this:

- Provide whatever is needed of the global state to the function, as arguments
- If the function needs to update the state, it shall not do it directly, but rather
  produce a new version of the state, and return it
- It will be the responsibility of the caller to take the returned state, if any, and
  update the global state

For example, Instead of doing this:

```
const roundFix = (function() {
  let accum = 0;
  return n => {
    // reals get rounded up or down
    // depending on the sign of accum
    let nRounded = accum > 0 ? Math.ceil(n) : Math.floor(n);
    console.log("accum", accum.toFixed(5), " result", nRounded);
    accum += n - nRounded;
    return nRounded;
  };
})();
```

Do this:

```
const roundFix2 = (a, n) => {
  let r = a > 0 ? Math.ceil(n) : Math.floor(n);
  a += n - r;
  return { a, r };
};
```

And now you can externally assign the `accum` value, like this:

```
let accum = 0;
// ...some other code...
let {a, r} = roundFix2(accum, 3.1415);
accum = a;
console.log(accum, r); // 0.1415 3
```
