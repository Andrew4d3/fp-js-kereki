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
