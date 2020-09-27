const padZeroes = (num) => {
  let str = num.toString();

  while (str.length < 2) {
    str = '0'.concat(str);
  }
  return str;
};

export { padZeroes };
