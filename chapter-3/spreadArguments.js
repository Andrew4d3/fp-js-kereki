function somethingElse() {
  // get arguments and do something
}

function listArguments(...args) { // All arguments are inside "args" (array)
  console.log(args); // [12, 4, 56]
  somethingElse(...args); // We can pass the same arguments to other function
}

listArguments(12, 4, 56); // We don't care the amount of arguments
