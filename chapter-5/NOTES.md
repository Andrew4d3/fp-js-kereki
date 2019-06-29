# Programming Declaratively - A Better Style

Let's use some HOF (High Order Functions) from now and on:

- reduce
- map
- forEach
- filter
- find

Using these functions lets you work more **declaratively**, and you'll see that your focus tends
to go to what is needed to do, and not so much on how it's going to be done; the dirty
details are hidden inside our functions.

## Transformations

The first set of operations we are going to consider, work on an array, and process it in the
base of a function to produce some results:

- reduce
- map
- forEach

### Reducing an array to a value

This is simply iterating over an array performing some operations (say, summing elements) to produce a single value:
![image](https://user-images.githubusercontent.com/1868409/59151176-94a33a80-89fc-11e9-8429-0ce62fc11eab.png)

#### Summing an array

Let's use the reduce function in a declarative way:

```
const myArray = [22, 9, 60, 12, 4, 56];
const sum = (x, y) => x + y;
const mySum = myArray.reduce(sum, 0); // 163
```

You don't actually need the sum definition; you might have just written
`myArray.reduce((x,y) => x+y, 0)` . However, in this fashion the meaning of the code
is clearer

### Calculating an average

Calculating average is also simple using reduce.

```
const average = arr => arr.reduce(sum, 0) / arr.length;
console.log(average(myArray)); // 27.166667
```

There's another way to achieve the same result:

```
const myArray = [22, 9, 60, 12, 4, 56];
const average2 = (sum, val, ind, arr) => {
  sum += val;
  return ind == arr.length - 1 ? sum / arr.length : sum;
};
console.log(myArray.reduce(average2, 0)); // 27.166667
```

But this approach could be less readable than the first one, which is more "mathematical oriented".

You can also add this "average" function to the Array prototype:

```
Array.prototype.average = function() {
  return this.reduce((x, y) => x + y, 0) / this.length;
};
let myAvg = [22, 9, 60, 12, 4, 56].average(); // 27.166667
```

Some people claim adding common functionalities to the Prototype is not suggestable. Since it can cause conflicts with other libraries. So bear that in mind!

### Calculating several values at once

Just use an object:

```
const average3 = arr => {
  const sc = arr.reduce(
    (ac, val) => ({ sum: val + ac.sum, count: ac.count + 1 }),
    { sum: 0, count: 0 }
  );
  return sc.sum / sc.count;
};
console.log(average3(myArray)); // 27.166667
```

And that's it! You may also use an array, but using an Object is way cleaner.

### Folding left and right

The function `reduceRight` is the same as `reduce` with the only difference. You will start iterating from the **last** array's element instead the first one. Other than that, it will behave exactly the same. For example, to reverse a string, you can do something like this:

```
const reverseString2 = str => str.split("").reduceRight((x, y) => x + y, "");
console.log(reverseString2("OEDIVETNOM")); // MONTEVIDEO
```

**NOTE**: You could use `reverse` string function here, but I wanted to show how `reduceRight` works.

## Applying an operation - map

In more computer-like terms, the map function transforms an array of inputs into an array of outputs.
![image](https://user-images.githubusercontent.com/1868409/60389403-75914900-9a8e-11e9-832c-150510a835f6.png)

What are the advantages of using .map() , over using a straightforward loop?

- First, you don't have to write any loops, so that's one fewer possible source of
  bugs
- Second, you don't even have to access the original array or the index position,
  even though they are there for you to use if you really need them
- And lastly, a new array is produced, so your code is pure (though, of course, if
  you really want to produce side-effects, of course, you can!)

There are only two caveats when using this:

- Always return something from your mapping function. If you forget this, since JS
  always provides a default return undefined for all functions, you'll just
  produce an undefined -filled array.
- If the input array elements are objects or arrays, and you include them in the
  output array, then JS will still allow the original elements to be accessed.

### Extracting data from objects

Let's say you have the following array:

```
const markers = [
  { name: "UY", lat: -34.9, lon: -56.2 },
  { name: "AR", lat: -34.6, lon: -58.4 },
  ...
  { name: "BR", lat: -15.8, lon: -47.9 },
  { name: "BO", lat: -16.5, lon: -68.1 }
];
```

And you want to calculta the average of the lattitued. You can use the past reduce function, the problem is such function expects an array of values, not of objects. What do we do? We use reduce and map together.

```
let averageLat = average(markers.map(x => x.lat));
let averageLon = average(markers.map(x => x.lon));
```

### Parsing numbers tacitly

Be careful when using "Point free" in map calls. Take this as example.

```
["123.45", "-67.8", "90"].map(parseInt); // [123, NaN, NaN]
```

The problem is the `parseInt` function expects two parameters, the value itself and the radix to be used when converting the number (default is 10). The problem is the callback map's function expects 3 parameters. The value, the index and the array being mapped. So we have a conflict over there. So avoid using point free in this situation.

```
["123.45", "-67.8", "90"].map(x => parseInt(x)); // [123, -67, 90]
```

### Working with ranges

Let's create our own "range" function which will create an array of numbers, with values ranging from start (inclusive) to stop (exclusive):

```
const range = (start, stop) =>
new Array(stop - start).fill(0).map((v, i) => start + i);
let from2To6 = range(2, 7); // [2, 3, 4, 5, 6];
```

We use the `fill` method to initialize to 0 each array's position and then use the map method to populate those spaces.

## More general looping

Map and Reduce could be too specific for what we want to do. Sometimes we just want to iterate over a series of array elements and that's it! We can use use `forEach` for such situations. Here there's an example using our range function:

```
const factorial4 = n => {
  let result = 1;
  range(1, n + 1).forEach(v => (result *= v));
  return result;
};
console.log(factorial4(5)); // 120
```

# Logical higher-order functions

Up to now, we have been using higher-order functions to produce new results, but there are
also some other functions that produce logical results, by applying a predicate to all the
elements of an array.

## Filtering an array

This is very similar to `map`. The difference is that instead of producing a new element, the result of your function determines whether the input value will be kept in the output (if the function returned a thruthy value ) or if it will be skipped (if the function returned a falsy value )

![image](https://user-images.githubusercontent.com/1868409/60390165-58647680-9a9e-11e9-8166-d2e4d7f49429.png)

### A filter() example

Let's suppose we have the following array of objects.

```
const accountsData = [
  {
    id: "F220960K",
    balance: 1024
  },
  {
    id: "S120456T",
    balance: 2260
  },
  {
    id: "J140793A",
    balance: -38
  },
  {
    id: "M120396V",
    balance: -114
  },
  {
    id: "A120289L",
    balance: 55000
  }
];
```

How can we get the list of IDs that are in the red, with a negative balance? We use `filter` for that.

```
const delinquent = serviceResult.accountsData.filter(v => v.balance < 0);
console.log(delinquent); // two objects, with id's J140793A and M120396V
const delinquentIds = delinquent.map(v => v.id);
```

Or even shorter:

```
const delinquentIds2 = serviceResult.accountsData
  .filter(v => v.balance < 0)
  .map(v => v.id);
```
