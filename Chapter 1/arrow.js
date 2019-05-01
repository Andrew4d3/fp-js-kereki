const fact2 = n => {
  if (n === 0) {
    return 1;
  } else {
    return n * fact2(n - 1);
  }
};
console.log(fact2(5)); // also 120
