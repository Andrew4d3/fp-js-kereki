function ShowItself2(identity) {
  this.identity = identity;
  setTimeout(() => {
    console.log(this.identity);
  }, 3000);
}
const x = new ShowItself2("JavaScript");

// The output will be "JavaScript"