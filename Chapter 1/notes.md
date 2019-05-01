# Chapter 1
## What is Functional Programming?
> FP is based on producing the desired result by evaluating expressions, built out
of functions composed together. In FP, it's usual to pass functions around (as parameters to
other functions, or returned as the result of some calculation), to not use loops (opting for
recursion instead), and to skip side effects (such as modifying objects or global variables).

>However, don't fall
into the trap of considering FP as a goal! Think of FP only as a means towards an end, as
with all software tools. Functional code isn't good just for being functional... and writing
bad code is just as possible with FP as with any other techniques!

*NOTE*: Don't go full FP!

## What Functional Programming is not
> FP isn't the opposite of object–oriented programming (OOP): Also, it isn't either
a case of choosing declarative or imperative ways of programming. You can mix
and match as it best suits you

*NOTE*: FP and OOP are not enemies. You can use both together and you should!

## Why use Functional Programming?
We agree our coud should be:
- **Modular**: In FP, the goal is writing separate independent functions, which are joined
together to produce the final results.
- **Understandable (easy to read)**: Programs written in functional style usually tend to be cleaner, shorter, and easier to understand.
- **Testable**: Functions can be tested on its own, and FP code has advantages for that.
- **Extensible (easy to scale)**: Once you get used to FP ways, code becomes more understandable and easier to extend
- Reusable: You can reuse functions in other programs, because they stand on their own, not depending on the rest of the system. Most functional programs share common functions.

> So, it seems that all five characteristics can be ensured with FP!

## Not all is good...
> Some FP solutions are actually tricky — and there are
developers who show much glee in writing code and then asking What does this do? If you
aren't careful, your code may become write–only, practically impossible to maintain...

> Another disadvantage: you may find it harder to find FP–savvy developers

> Finally, if you try to go fully functional, you may find yourself at odds with JS, and simple tasks may become hard to do

## Is JavaScript functional?
>If we ask if JS is actually functional, the answer will be, once again, sorta. JS can be
considered to be functional, because of several features such as first–class functions,
anonymous functions, recursion, and closures -- we'll get back to this later. On the other
hand, JS has plenty of non–FP aspects, such as side effects (impurity), mutable objects, and
practical limits to recursion

## Key features of JavaScript
- Functions as first–class objects
- Recursion
- Arrow functions
- Closures
- Spread
### Functions as first–class objects
> For example, you can store a function in a variable, you can pass it to a function, you can print it out, and so on. This is really the key to doing FP: we will often be passing functions as parameters (to other functions) or returning a function as the result of a function call

Example
### Recursion
Example
### Closures
### Arrow Functions
### Spread
Example
> Using the spread operator helps write shorter, more concise code, and we will be taking
advantage of it.