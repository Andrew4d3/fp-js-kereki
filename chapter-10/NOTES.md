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

But doing all this can become cumbersome and tedious. So we have to find a beeter way.

### Getting a property

As I mentioned, going through all the steps of copying and freezing objects and properties might become troublesome. A good way to resolve this is by implementing another helper function where we can obtain copies of any property we want.

```
const getByPath = (arr, obj) => {
    if (arr[0] in obj) {
        return arr.length > 1
            ? getByPath(arr.slice(1), obj[arr[0]])
            : deepCopy(obj[arr[0]]);
    } else {
        return undefined;
    }
};
```

Let's see how we can use it:

```
let myObj3 = {
    d: 22,
    m: 9,
    o: { c: "MVD", i: "UY", f: { a: 56 } }
};

deepFreeze(myObj3);

console.log(getByPath(["d"], myObj3)); // 22
console.log(getByPath(["o"], myObj3)); // {c: "MVD", i: "UY", f: {a: 56}}
console.log(getByPath(["o", "c"], myObj3)); // "MVD"
console.log(getByPath(["o", "f", "a"], myObj3)); // 56
````
We can also check that returned objects are not frozen.
```
let fObj = getByPath(["o", "f"], myObj3);
console.log(fObj); // {a: 56}
fObj.a = 9999;
console.log(fObj); // {a: 9999} -- it's not frozen
```

## Persistent data structures

Cloning a whole object when we only need to update a couple of properties doesn't seem to be efficient. Imagine for a second, we have a payload object like this:

```
const payload = {
    foo: {
        a: "a",
        b: "c",
        c: "c"
    },
    bar: {
        d: "",
        e: {
            e1: "e1"
        },
        f: [1,2,3]
    }
}
```
And the only thing we require is to update the path `payload.bar.e.e1`. If we cloned the entire object, we would be cloning instances that we're not even touching, like the paths: `payload.foo` and `payload.bar.f`. That's highly unefficient! We need to find a better way.

### Updating objects

Let's implement a new helper function called `setIn`. This function will clone the neccessary instances from our object and let those ones we don't touch unaltered.

```
const setIn = (arr, val, obj) => {
    const newObj = Number.isInteger(arr[0]) ? [] : {};
    Object.keys(obj).forEach(k => {
        newObj[k] = k !== arr[0] ? obj[k] : null;
    });
    newObj[arr[0]] =
        arr.length > 1 ? setIn(arr.slice(1), val, obj[arr[0]]) : val;
    return newObj;
};
```

Let's test this helper function:

```
let myObj1 = {
    a: 111,
    b: 222,
    c: 333,
    d: {
        e: 444,
        f: 555,
        g: {
            h: 666,
            i: 777
        },
        j: [{ k: 100 }, { k: 200 }, { k: 300 }]
    }
};

let myObj2 = setIn(["d", "f"], 88888, myObj1);
/*
{
    a: 111,
    b: 222,
    c: 333,
    d: {
        e: 444,
        f: 88888, // This has changed
        g: {h: 666, i: 777},
        j: [{k: 100}, {k: 200}, {k: 300}]
    }
}
*/
console.log(myObj.d === myObj2.d); // false
console.log(myObj.d.f === myObj2.d.f); // false
console.log(myObj.d.g === myObj2.d.g); // true (because it's out of our path)
```

In the same fashion, we can create a `deleteIn` function, which will delete any desired property path. The implementations is pretty much the same as `setIn` with the only difference being: we skip to create anything on the entered path.

```
const deleteIn = (arr, obj) => {
    const newObj = Number.isInteger(arr[0]) ? [] : {};
    Object.keys(obj).forEach(k => {
        if (k !== arr[0]) {
            newObj[k] = obj[k];
        }
    });
    if (arr.length > 1) {
        newObj[arr[0]] = deleteIn(arr.slice(1), obj[arr[0]]);
    }
    return newObj;
};
```