# Ensuring Purity - Immutability

Immutability consists in not modifying any argument or global variable in order to avoid side effects and keep our functions pure.

In JavaScript, ensuring immutability whitin functions can be a challenging tasks when dealing with non-primitive arguments. Since these are usually past as reference. That's why it's important to understand some techniques to achieve this immutability.

## The straightforward JS way

### Freezing

If we want to avoid the possibility of a programmer accidentally or willingly modifying an
object, freezing it is a valid solution. After an object has been frozen, any attempts at
modifying it will silently fail.

```
const myObj = { d: 22, m: 9 };
Object.freeze(myObj);
myObj.d = 12; // won't have effect...
console.log(myObj);
// Object {d: 22, m: 9}
```

Unfortunately, `freeze` is a shallow operation so it won't have any effect to any nested object. As we can see here:

```
let myObj3 = {
  d: 22,
  m: 9,
  o: { c: "MVD", i: "UY", f: { a: 56 } }
};
Object.freeze(myObj3);
console.log(myObj3);
// {d:22, m:9, o:{c:"MVD", i:"UY", f:{ a:56}}}
myObj3.d = 8888;
// wont' work
myObj3.o.f.a = 9999; // oops, does work!!
console.log(myObj3);
// {d:22, m:9, o:{c:"MVD", i:"UY", f:{ a:9999 }}}
```

How can we resolve this? By creating a `deepFreeze` function that recursively can freeze any nested object we have:

```
const deepFreeze = obj => {
  if (obj && typeof obj === "object" && !Object.isFrozen(obj)) {
    Object.freeze(obj);
    Object.getOwnPropertyNames(obj).forEach(prop => deepFreeze(obj[prop]));
  }
  return obj;
};
```

### Cloning and mutating

What about situations when we receive a frozen object but then we need to produce a new copy with some modified properties? How can we tackle this issue?

Of course, you can clone the new object by hand, but that might turn to be a hassle if we're dealing with multiple properties and nested objects.

Another option would be to use `Object.assign` and the spread operator `(...obj)` but here we're dealing with same issue we dealt with `Object.freeze` which is this operation being "shallow".

So just as we did with freezing, we can implement a helper function that recursively copy all of our object properties:

```
const deepCopy = obj => {
  let aux = obj;
  if (obj && typeof obj === "object") {
    aux = new obj.constructor();
    Object.getOwnPropertyNames(obj).forEach(
      prop => (aux[prop] = deepCopy(obj[prop]))
    );
  }
  return aux;
};

```

And now we can produce reliable copies of any object we want:

```
let oldObject = {
  d: 22,
  m: 9,
  o: { c: "MVD", i: "UY", f: { a: 56 } }
};
let newObject = deepCopy(oldObject);
newObject.d = 8888;
newObject.o.f.a = 9999;
console.log(newObject);
// {d:8888, m:9, o:{c:"MVD", i:"UY", f:{a:9999}}}
console.log(oldObject);
// {d:22, m:9, o:{c:"MVD", i:"UY", f:{a:56}}} -- unchanged!
```

Now we know how to freeze and copy any (frozen) object. And we can work on this way:

1. Receive a frozen object as an argument
2. Make a (unfrozen) copy of it.
3. Do whatever we want with the copy (modify properties, etc)
4. Freeze the new copy
5. Return it as the function result.

But doing all this can become cumbersome and tedios. So we have to find a beeter way.
