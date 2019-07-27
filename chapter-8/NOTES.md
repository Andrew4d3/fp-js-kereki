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
