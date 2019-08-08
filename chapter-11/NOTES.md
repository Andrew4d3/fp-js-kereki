# Implementing Design Patterns - The Functional Way
Here we're going to find some FP equivalents for well-known OOP design patterns. 

## Object-oriented design patterns
### Façade or Adapter
This design pattern consists on implmenting a common interface for a third-party library or code. For example: a common interface for making HTTP requests.

Applying this pattern in FP is not an issue. We can implement a function or module that imports the external library and provides its functionaly through some common methods we define. Example:

```
// simpleAjax.js
import * as hard from "hardajaxlibrary";
// import the other library that does Ajax calls
// but in a hard, difficult way, requiring complex code
const convertParamsToHardStyle = params => {
    // do some internal things to convert params
    // into the way that the hard library requires
};
const makeStandardUrl = url => {
    // make sure the url is in the standard
    // way for the hard library
};
const getUrl = (url, params, callback) => {
    const xhr = hard.createAnXmlHttpRequestObject();
    hard.initializeAjaxCall(xhr);
    const standardUrl = makeStandardUrl(url);
    hard.setUrl(xhr, standardUrl);
    const convertedParams = convertParamsToHardStyle(params);
    hard.setAdditionalParameters(params);
    hard.setCallback(callback);
    if (hard.everythingOk(xhr)) {
        hard.doAjaxCall(xhr);
    } else {
        throw new Error("ajax failure");
    }
};
const postUrl = (url, params, callback) => {
    // some similarly complex code
    // to do a POST using the hard library
};
export { getUrl, postUrl }; // the only methods that will be seen
```

Now you can apply a same pattern using an IIFE (Immediately invoked function expression):

```
const simpleAjax = (function () {
    const hard = require("hardajaxlibrary");
    const convertParamsToHardStyle = params => {
        // ...
    };
    const makeStandardUrl = url => {
        // ...
    };
    const getUrl = (url, params, callback) => {
        // ...
    };
    const postUrl = (url, params, callback) => {
        // ...
    };
    return {
        getUrl,
        postUrl
    };
})();
```

Now take into account that your third-party library could not be pure (side effects, mutability, etc). That would make your common interfacte not pure either.

### Decorator or Wrapper

Decorator pattern (also known as "wrapper") consists on adding extra functionality to an existing class or module. This is easily achievable in FP using High-Order Functions. We already saw some examples of using this for logging a memoazing. Let's see another example:

```
const calculateArea = (side1, side2) => side1 * side2;

const inInches = (fn) => (...args) => fn(...args) * 2.54;

const calculateAreaInInches = inInches(calculateArea);

console.log(calculateArea(2,2)); // In CM
console.log(calculateAreaInInches(2, 2)); // In Inches
```

Here we're "decorating" the `calculateArea` function to return the are in inches instead of centimeters.

### Strategy, Template, and Command

Sometimes we come across situations where we have a similar problem, sharing some logic in common but with some differences in specific parts. The first think you think to resolve such problems is working with conditionals or switch statements. Like this:

```
const function = resolveProblem = (case) => {
    // Logic in common

    if (case == "something") {
        // do something
    } else if (case === "something-else") {
        // do something else
    } else if(...
    ...
    // etc etc
}
```
 The problem with this approach is that doesn't offer a high level of cohesion, which causes several problems of scalability and maintanibility. In such situations, applying a strategy pattern desireble. Something like this:

```
function findRoute(routeAlgorithm, fromPoint, toPoint) {
    return routeAlgorithm(fromPoint, toPoint);
}
```

Now the only thing you have to worry is to implment the `routeAlgorithm` functions and pass them out as parameters. This function itself is what we call a "strategy". As long as our code grows, we can define more strategies.

