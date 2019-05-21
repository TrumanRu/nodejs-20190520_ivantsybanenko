function sum(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    // было бы неплохо добавить && !isNaN(a) && !isNaN(b)
    // но формально - NaN тоже Number, так что должно проходить по условию задачи
    return a + b;
  } else {
    throw new TypeError('Wrong datatype');
  }
}

module.exports = sum;
