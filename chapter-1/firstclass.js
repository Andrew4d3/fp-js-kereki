var doSomething = function(status) { // Declaring a function as a variable
  // check status, and do something
};

var foo = function(data, func) { // Passing function as a parameter
    func(data);
}

foo("some data", doSomething);
