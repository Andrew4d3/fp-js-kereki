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

#### Injecting impure functions

You can separate the "impure parts" of your implementation and inject them into your pure funcitions. For example, this function:

```
const getRandomFileName = (fileExtension = "") => {
...
  for (let i = 0; i < NAME_LENGTH; i++) {
    namePart[i] = getRandomLetter();
  }
...
};
```

The function above is impure because the `getRandomLetter` function is impure. So let's refactor this a little bit:

```
const getRandomFileName2 = (fileExtension = "", randomLetterFunc) => {
  const NAME_LENGTH = 12;
  let namePart = new Array(NAME_LENGTH);
  for (let i = 0; i < NAME_LENGTH; i++) {
    namePart[i] = randomLetterFunc();
  }
  return namePart.join("") + fileExtension;
};
```

Here we're injecting the `randomLetterFunc`. Now you are probably thinking: "But this doesn't ensure purity because the `randomLetterFunction` can be impure". Yes, but we can inject -for testing purporses- a pure function and that would make this function pure too.

In the end we will have a function that behaves as a pure function for testing and still have its correct behavior when it runs normally.

### Is your function pure?

You may say a function like this is pure:

```
const sum3 = (x, y, z) => x + y + z;
```

But here we're assuming that the parameters recieved are numbers or strings. But what if we try something like this:

```
let x = {};
x.valueOf = Math.random;
let y = 1;
let z = 2;
console.log(sum3(x, y, z)); // 3.2034400919849431
console.log(sum3(x, y, z)); // 3.8537045249277906
console.log(sum3(x, y, z)); // 3.0833258308458734
```

It seems we don't have a pure function anymore. In the end, it actually depends on whatever parameters you pass to it! Adding some type checking (TypeScript might come
in handy) you could at least prevent some cases -- though JS won't ever let you be totally
sure that your code is always pure!

## Testing - pure versus impure

Impurity in your functions cannot be 100% avoided. Thus, you have to find the ways to structure your code so you can isolate the impure functions.
When testing your code. You're going to have to deal with pure and impure functions. Writing tests for the first ones can be more challenging than doing so for the last ones.

### Testing pure functions

This is not a problem. In the end, everything comes to:

- Call the function with a given set of arguments
- Verify that the results match what you expected
  And that's it! For Example, unit-testing the past `isOldEnough3` function:

```
describe("isOldEnough", function() {
  it("is false for people younger than 18", () => {
    expect(isOldEnough3(1978, 1963)).toBe(false);
  });
  it("is true for people older than 18", () => {
    expect(isOldEnough3(1988, 1965)).toBe(true);
  });
  it("is true for people exactly 18", () => {
    expect(isOldEnough3(1998, 1980)).toBe(true);
  });
});
```

### Testing purified functions

When testing functions that handle some type of state. We need to test the function result as well as the updated state. We also need to be careful with functions performing calculations with float values. Since they might have some side effects caused by loss in precision. Example:

```
describe("roundFix2", function() {
  it("should round 3.14159 to 3 if differences are
    let {a, r} = roundFix2(0.0, 3.14159);
    expect(a).toBeCloseTo(0.14159);
    expect(r).toBe(3);
  });
  it("should round 2.71828 to 3 if differences are
    let {a, r} = roundFix2(0.14159, 2.71828);
    expect(a).toBeCloseTo(-0.14013);
    expect(r).toBe(3);
  });
  it("should round 2.71828 to 2 if differences are
    let {a, r} = roundFix2(-0.14013, 2.71828);
    expect(a).toBeCloseTo(0.57815);
    expect(r).toBe(2);
  });
  it("should round 3.14159 to 4 if differences are
    let {a, r} = roundFix2(0.57815, 3.14159);
    expect(a).toBeCloseTo(-0.28026);
    expect(r).toBe(4);
  });
});
```

Notice how we're using the `toBeCloseTo` assert method to verify we are meeting the required proximity.

### Testing impure functions

One way of testing impure functions is by doing some _white box testing_. We do this when we have some knowledge about how the function that we are testing works. For this, we can use "mocks" and "spys" to alter and examinate our functions behaviours. Exmaple:

```
describe("getRandomLetter", function() {
  it("returns A for values close to 0", () => {
    spyOn(Math, "random").and.returnValue(0.0001);
    let letterSmall = getRandomLetter();
    expect(Math.random).toHaveBeenCalled();
    expect(letterSmall).toBe("A");
  });

  it("returns Z for values close to 1", () => {
    spyOn(Math, "random").and.returnValues(0.98, 0.999);
    let letterBig1 = getRandomLetter();
    let letterBig2 = getRandomLetter();
    expect(Math.random).toHaveBeenCalledTimes(2);
    expect(letterBig1).toBe("Z");
    expect(letterBig2).toBe("Z");
  });

  it("returns a middle letter for values around 0.5", () => {
    spyOn(Math, "random").and.returnValue(0.49384712);
    let letterMiddle = getRandomLetter();
    expect(Math.random.calls.count()).toEqual(1);
    expect(letterMiddle).toBeGreaterThan("G");
    expect(letterMiddle).toBeLessThan("S");
  });
});
```

- In the first example we are "spying" the `Math.random` function and we also mocking its result to `0.0001`. Thus, this test will verify if such function gets called. Aditionally, our `getRandomLetter` is expected to return an "A" value for entries close to 0.0001, so we're making that assertion too.
- In the second example, we are doing pretty much the same as the first example. But this time, we are mocking two consecutive `Math.random` results (0.98, 0.999). With this, we should expected to receive "Z" values for entries close to 1.
- In the last example, we do something similiar but for an entry close to 0.5. Since we cannot exactly predict which letter will result. We have to set our assertions to be within a range of "G" and "S".

If we want to test an impure function without mocking, that's way harder. One way is not to test the result's value but its properties instead. Example:

```
describe("getRandomFileName, with an impure getRandomLetter function", function() {
  it("generates 12 letter long names", () => {
    for (let i = 0; i < 100; i++) {
      expect(getRandomFileName().length).toBe(12);
    }
  });
  it("generates names with letters A to Z, only", () => {
    for (let i = 0; i < 100; i++) {
      let n = getRandomFileName();
      for (j = 0; j < n.length; n++) {
        expect(n[j] >= "A" && n[j] <= "Z").toBe(true);
      }
    }
  });
  it("includes the right extension if provided", () => {
    let fileName1 = getRandomFileName(".pdf");
    expect(fileName1.length).toBe(16);
    expect(fileName1.endsWith(".pdf")).toBe(true);
  });
  it("doesn't include any extension if not provided", () => {
    let fileName2 = getRandomFileName();
    expect(fileName2.length).toBe(12);
    expect(fileName2.includes(".")).toBe(false);
  });
});
```

Here we're testing the result properties from the `getRandomFileName`:

- We know we are always going to get a 12-length string
- We know that string will always have letters from "A" to "Z" (not special characters allowed)
- We know that if we provide a file extension, the file name returned should end with that extension.
- And we should get the opposite from before if not extension is provided.

Based on these properties, we can design our assertions for such impure function.
