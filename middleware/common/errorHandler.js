const { StatusCodes } = require("http-status-codes");
const { MulterError } = require("multer");
const notFoundHandler = (req, res) => {
  res
    .status(StatusCodes.NOT_FOUND)
    .json({ message: "Not Found...!", status: StatusCodes.NOT_FOUND });
};

const defaultErrorHandler = (error, req, res, next) => {
  if (error) {
    if (error instanceof MulterError) {
      console.log("....multer Error.....");
      console.log(error);
      return res.status(400).send(error.message);
    }
    console.log(error);
    return res.status(500).send(error.message);
  }
  next();
};

module.exports = { notFoundHandler, defaultErrorHandler };
