# Designing Functions - Recursion

As you may know, A recursive function is a function that calls itself. In Functional programming we want to avoid loops as much as possible. So recursion is a natural solution for this.

But how can we deal with the performance issues that recursion brings on? One possible solution - that we already discussed - is memeoization. But this one in particular is not feasible in all situations.

Next, we will see some techniques

## Tail call optimization with continuation passing style

Tail call optimization is a well-known way to alleviate all those recursion stack issues. Unfortunately, applying this technique in JS is not as simple as it is in other languages.

Lucky for us, there's a workaround we can use to implment some level of tail call optimization by using continuation passing style.

Consider this factorial function we aleady know:

```
function fact(n) {
    if (n === 0) {
        return 1;
    } else {
        return n * fact(n - 1);
    }
}
```

Here we aren't doing any optimization whatsoever. Let's refactor this function by applying continuing passing style:

```
function factC(n, cont) {
    if (n === 0) {
        return cont(1);
    } else {
        return factC(n - 1, x => cont(n * x));
    }
}

factC(7, x => x); // 5040, correctly
```

## Trampoline and thunks

Another way is using a "trampoline", which is, using a function instead of the actual value, so that we can avoid stacking calls.

```
const trampoline = (fn) => {
    while (typeof fn === 'function') {
        fn = fn();
    }
    return fn;
};
```

You can use it like this:

```
const sumAll3 = n => {
    const sumAllT = (n, cont) =>
        n === 0
            ? () => cont(0)
            : () => sumAllT(n - 1, v => () => cont(v + n));
    return trampoline(sumAllT(n, x => x));
};
```
