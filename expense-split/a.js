function add(x) {
  return function(y) {
      if (typeof y !== 'undefined') {
        x = x + y;
        return x;
      } else {
        return x+10;
      }
    };
  }

  console.log(add(10)(20));
  console.log(add(10)());
  console.log(add(20)());
