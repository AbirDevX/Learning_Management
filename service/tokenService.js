const jwt = require("jsonwebtoken");

const generateUserToken = (tokenPayload) => {
  return jwt.sign(tokenPayload, process.env.USER_SECRET);
};
module.exports = { generateUserToken };
