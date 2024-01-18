const jwt = require("jsonwebtoken");

async function isAdmin(req, res, next) {
  try {
    if (req.cookies && req.cookies["admin_token"]) {
      const token = req.cookies["admin_token"];
      // console.log(token)
      jwt.verify(token, process.env.ADMIN_SECRET, (err, decoded) => {
        if (err) {
          res.clearCookie("admin_token");
          return res.redirect("/admin/login");
        }
        req.admin = decoded;
        return next();
      });
    } else {
      // res.clearCookie("admin-token");
      throw new Error("UnAuthorize..!");
    }
  } catch (error) {
    console.log(error?.message);
    // res.status(401).json({ error: error?.message, msg: "UnAuthorization..!" });
    return res.redirect("/admin/login");
  }
}

module.exports = { isAdmin };
