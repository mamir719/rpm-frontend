function isEven(n) {
  return n % 2 === 0;
}

// Example
console.log(isEven(4)); // true
console.log(isEven(7)); // falscd

let arr = [5, 2, 3, 4, 1];
let first = -1,
  second = -1;
for (let num of arr) {
  console.log(num);
  if (num > first) {
    second = first;
    first = num;
  } else if (num > second && num < first) {
    second = num;
  }
}
console.log("First Largest num: ", first);
console.log("Second Largest num: ", second);
