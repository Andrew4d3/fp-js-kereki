// Mocking fetch
const fetch = () => Promise.resolve({ data: "foo" });

function processResult(data) {
  // Do something with data
  console.log("data");
}

// Don't do this!
fetch("some/remote/url").then(function(data) {
  processResult(data); // This is the only function called inside the promise handler. So it's not required!
});

// Do this instead!
fetch("some/remote/url").then(processResult);
