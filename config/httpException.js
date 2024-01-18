class HttpException extends Error {
  constructor(statusCode, message) {
    super();
    this.message = message;
    this.status = statusCode;
  }
}

module.exports = { HttpException };
