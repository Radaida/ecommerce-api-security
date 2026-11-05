// Lets controllers use async/await without repeating try/catch.
// Any thrown error is passed to the global error handler.
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
