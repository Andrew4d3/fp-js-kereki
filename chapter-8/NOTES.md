# Connecting Functions - Pipelining and Composition

## Pipelining

What if we want the return value of a function to be the parameter of the next one? We could do something like this:

```
const add = (a, b) => a + b;
const buildMessage = (value) => "The result is " + value;

const addResult = add(1, 2);
const message = buildMessage(addResult);

console.log(message);
```

The problem with this approach is we're relying too much in auxiliar variables (`addResult` and `message`). We could shorten this by doing:

```
console.log(buildMessage(addResult(1, 2)));
```

But now it's difficult to read. Imagine we're applying more than 2 functions. Suddenly we are in the middle of parenthesis hell. This is where **pipelining** comes handy. We can use an utility function that does something like this:

```
pipeline([
  add,
  buildMessage,
  console.log
])(1, 2);
```

This is much easier to read and understand. Since now we have a clear idea about the execution order.

### Creating pipelines

You can create your own implementation of pipeline by doing this:

```
const pipeline = (...fns) => (...args) => {
  let result = fns[0](...args);
  for (let i = 1; i < fns.length; i++) {
    result = fns[i](result);
  }
  return result;
};
```

Or maybe you want to take a more functional approach.

```
const pipeline2 = (...fns) =>
  fns.reduce((result, f) => (...args) => f(result(...args)));
```

### Debugging pipelines

Now, how do we debug pipelines? There are two ways to achieve this. Tapping or logging.

#### Tapping into a flow

A tap function is a custom function which is inserted into our pipeline between two steps. This function can either change the returning value from the previous function or not. Example:

```
const tap = (param) => {
  // Do some debugging stuff, We could mutate the parameter here...
  console.log("Hello from tap", param);
  return param;
};
```

And now we just need to add this tap function wherever we want it to be.

```
pipeline([
  add,
  tap, // -> "Hello from tap" 3
  buildMessage,
  console.log
])(1, 2);
```

#### Using a logging wrapper

The second idea was already covered in chapter 7. We can create a high-order function that logs the arguments and returning values.

```
pipeline([
   addLogging(add),
   addLogging(buildMessage),
   addLogging(console.log)
])(1, 2);
```

Try not to overuse the logging wrapper. Just use it in functions where you want to do some debugging or logging.

### Chaining and fluent interfaces

Some similar concept to pipelining is the concept of "method chaining". Consider the `moment` library when you can see things like:

```
const customDate = moment()
  .add(2, "days")
  .subtract(2, "hours")
  .add(2, "seconds")
  .toISOString();
```

This happens because all the setters methods return `this` which leads to a more declarative way to code. Since now it's possible to use any instance method right away.

The easyiest way to implement this is by returning the `this` object in every setter method. But if you don't want to go through all those methods (maybe you have a lot!) you can create your own "chainigy" function that takes any method that returns `undefined` and change it to return `this`.

For this, we can use a Proxy instance. Example:

```
const getHandler = {
  get(target, property, receiver) {
    if (typeof target[property] === "function") {
      // requesting a method? return a wrapped version
      return (...args) => {
        const result = target[property](...args);
        return result === undefined ? target : result;
      };
    } else {
      // an attribute was requested - just return it
      return target[property];
    }
  }
};

const chainify = obj => new Proxy(obj, getHandler);
```

Most of the code is self-explanatory. Take into account that the `receiver` argument is the proxified instance. Pretty much equivalent to returning `this` in your normal class.

Example:

```
class MyHome {
  constructor(country, city, address) {
    this.country = country;
    this.city = city;
    this.address = address;
  }

  getCountry() {
    return this.country;
  }

  getCity() {
    return this.city;
  }

  getAddress() {
    return this.address;
  }

  setCountry(country) {
    this.country = country;
  }

  setCity(city) {
    this.city = city;
  }

  setAddress(address) {
    this.address = address;
  }
}

const myHome = chainify(new MyHome("Venezuela", "Caracas", "El Valle 123"));

myHome
  .setCountry("Chile")
  .setCity("Santiago")
  .setAddress("Eleuterio 123"); // We're chainning methods here!
```

## Composing

Composing is the oposite of pipelining. While in pipelining you go from left to right, in composining you go from right to left. As you may imagine, the implementation is pretty much the same, execpt for the fact that now we reverse the input array.

```
const compose = (...fns) => pipeline(...(fns.reverse()));
```

The examples are similar to the ones with pipelining, but now the input array has an inverted order. You might wonder, "why do we need a function that does exactly the same but different?" and the answer is: It's up to you to decide whether to use one or another one!. Some people would prefer to go with this way rather than the other one. Since you get the focus of the final step right away.

## Testing composed functions

As usual, testing is quite simple:

```
describe("pipeline", function () {
    beforeEach(() => {
        fn1 = () => { };
        fn2 = () => { };
        fn3 = () => { };
        fn4 = () => { };
    });
    it("works with a single function", () => {
        spyOn(window, "fn1").and.returnValue(11);
        const pipe = pipeline(fn1);
        const result = pipe(60);
        expect(fn1).toHaveBeenCalledTimes(1);
        expect(fn1).toHaveBeenCalledWith(60);
        expect(result).toBe(11);
    });
    // we omit here tests for 2 functions,
    // which are similar to those for pipeTwo()
    it("works with 4 functions, multiple arguments", () => {
        spyOn(window, "fn1").and.returnValue(111);
        spyOn(window, "fn2").and.returnValue(222);
        spyOn(window, "fn3").and.returnValue(333);
        spyOn(window, "fn4").and.returnValue(444);
        const pipe = pipeline(fn1, fn2, fn3, fn4);
        const result = pipe(24, 11, 63);
        expect(fn1).toHaveBeenCalledTimes(1);
        expect(fn2).toHaveBeenCalledTimes(1);
        expect(fn3).toHaveBeenCalledTimes(1);
        expect(fn4).toHaveBeenCalledTimes(1);
        expect(fn1).toHaveBeenCalledWith(24, 11, 63);
        expect(fn2).toHaveBeenCalledWith(111);
        expect(fn3).toHaveBeenCalledWith(222);
        expect(fn4).toHaveBeenCalledWith(333);
        expect(result).toBe(444);
    });
});
```

And the same applies to composing.