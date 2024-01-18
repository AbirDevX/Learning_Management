const jwt = require("jsonwebtoken");
const UserModel = require("../../model/userModel");

async function isAuthorized(req, res, next) {
  try {
    if (req.cookies && req.cookies["user_token"]) {
      const token = req.cookies["user_token"];
      // console.log(token)
      jwt.verify(token, process.env.USER_SECRET, async (err, decoded) => {
        const user = await UserModel.findById(decoded?.id);
        if (err || !user.isActive) {
          res.clearCookie("user_token");
          return res.redirect("/login");
        }
        req.user = decoded;
        return next();
      });
    } else {
      // res.clearCookie("admin-token");
      throw new Error("UnAuthorize..!");
    }
  } catch (error) {
    console.log(error?.message);
    // res.status(401).json({ error: error?.message, msg: "UnAuthorization..!" });
    return res.redirect("/login");
  }
}

module.exports = { isAuthorized };
