const path = require('path');

/**
 * Get filename from path
 *
 * @param {string} p
 * @returns
 */
const filename = p => {
  if (p.match(new RegExp(path.sep))) {
    return p.substring(p.lastIndexOf(path.sep) + 1, p.length);
  }

  return p;
};

// https://stackoverflow.com/a/5834507
function VarOperator(op) {
  this.operation = op;
  this.evaluate = function evaluate(param1, param2) {
    switch (this.operation) {
      case '+':
        return +param1 + +param2;
      case '-':
        return +param1 - +param2;
      case '*':
        return +param1 * +param2;
      case '/':
        return +param1 / +param2;
      case '<':
        return +param1 < +param2;
      case '>':
        return +param1 > +param2;
      case '=':
        return param1 === param2;
    }
  };
}

/**
 * Add a zero if under 10
 * @param {Number} number
 * @returns
 */
let zeroBefore = number => {
  return +number < 10 ? '0' + number : number;
};

module.exports = {
  filename,
  VarOperator,
  zeroBefore
};
