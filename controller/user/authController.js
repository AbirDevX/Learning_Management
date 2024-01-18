const UserModel = require("../../model/userModel");

async function confirmationToLogin(req, res) {
  if (!req?.params?.email || !req?.params?.token) {
    req.flash("error", "User Verify Failed..!");
    return res.redirect("/login");
  }
  //
  try {
    const user = await UserModel.findOne({
      email: req.params.email,
    });
    if (!user) {
      req.flash("error", "User Verify Failed..!");
      return res.redirect("/login");
    }

    // Check User Already verified OR not
    if (user.isVerified) {
      req.flash("warn", "User Already Verify.");
      return res.redirect("/login");
    } else {
      const updatedUser = await UserModel.findByIdAndUpdate(
        user?._id,
        { isVerified: true },
        { new: true }
      );
      if (updatedUser) {
        // SEND SUCCESS response to Client
        req.flash("success", "User Verify SuccessFully");
        return res.redirect("/login");
      } else {
        throw new Error();
      }
    }
  } catch (error) {
    console.log(error);
    req.flash("error", "User Verify Failed..!");
    return res.redirect("/login");
  }
}

module.exports = { confirmationToLogin };
