module.exports = (value) => {
  if (!/^[1-9]\d*$/.test(String(value)) || !Number.isSafeInteger(Number(value))) {
    const error = new Error('El identificador debe ser un entero positivo');
    error.status = 400;
    throw error;
  }
  return Number(value);
};
