const once = fn => {
  let done = false; // Here we're taking advantage of closure to initialize the done flag
  return (...args) => {
    if (!done) {
      done = true; // So that we won't trigger the function again
      fn(...args);
    }
  };
};

const example = function() {
  const fooFunc = function() {
    console.log("function called!");
  };

  onceFoo = once(fooFunc);
  onceFoo();
  onceFoo();
  onceFoo();
};

// fooFunc is called just once!
// example();

module.exports = once;
