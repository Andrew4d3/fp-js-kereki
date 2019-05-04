function fact(n) {
  if (n === 0) {
    return 1;
  } else {
    return n * fact(n - 1); // It calls itself
  }
}
console.log(fact(5)); // 120
