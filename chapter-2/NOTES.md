# Thinking Functionally - A First Example

## The problem - do something only once

Let's consider a simple, but common situation. You have developed an e-commerce site: the
user can fill their shopping cart, and at the end, they must click on a BILL ME button, so
their credit card will be charged. However, the user shouldn't click twice (or more) or they
would be billed several times.

_From here there are a lot of solutions that are not functional, so we are going to skip them_

## A functional solution

> If we don't want to modify the original function, we'll create a higher-order function, which
> we'll, inspiredly, name once() . This function will receive a function as a parameter and
> will return a new function, which will work only a single time.

- [Example](https://github.com/Andrew4d3/fp-js-kereki/blob/master/chapter-2/once.js)
- [Example Test](https://github.com/Andrew4d3/fp-js-kereki/blob/master/chapter-2/once.test.js)

## Summary

> In this chapter, we've seen a common, simple problem, based on a real-life situation, and
> after analyzing several usual ways of solving that, we went for a functional thinking solution.
> We saw how to apply FP to our problem, and we also found a more general higher-order
> way that we could apply to similar problems, with no further code changes. We saw how to
> write unit tests for our code, to round out the development job. Finally, we even produced
> an even better solution (from the point of view of the user experience) and saw how to code
> it and how to unit test it.
