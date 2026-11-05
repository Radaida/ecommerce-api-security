// An error that carries an HTTP status code and a message that is safe to show to clients.
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

module.exports = ApiError;
