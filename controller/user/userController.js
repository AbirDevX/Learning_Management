const bcrypt = require("bcrypt");
const { Validator } = require("node-input-validator");
const jwt = require("jsonwebtoken");
const UserModel = require("../../model/userModel");
const { UserEnum } = require("../../config/enum");
const { sendingEmail } = require("../../service/mailService");
const { generateUserToken } = require("../../service/tokenService");

/*==============LOGIN-SECTION================*/
const renderUserLogin = (req, res) => {
  if (req.cookies && req.cookies["user_token"]) {
    return res.redirect("/");
  }
  res.render("user/login", {
    title: "login page",
    value: "",
    error: "",
    flashMsg: {
      error: req.flash("error"),
      success: req.flash("success"),
      warn: req.flash("warn"),
    },
    url: req.url,
  });
};
// LOGIN
const userLogin = async (req, res) => {
  try {
    const payload = req.body;
    // console.log(payload);
    const v = new Validator(payload, {
      email: "required|email",
      password: "required|string",
    });
    const matched = await v.check();
    if (!matched) {
      // console.log(v.errors);
      return res.render("user/login", {
        error: v.errors,
        title: "Login Page",
        flashMsg: {
          error: req.flash("error"),
          success: req.flash("success"),
          warn: req.flash("warn"),
        },
        value: req.body,
        url: req.url,
      });
    }
    // Check Valid Password
    const validUser = await UserModel.findOne({
      email: req.body.email,
      role: UserEnum.USER,
    });
    if (!validUser) throw new Error("Not found! Try again..!");
    // CHECK USER IS VERIFIED OT NOT
    if (!validUser.isVerified)
      throw new Error("User not verified..! check your email.");
    if (!validUser.isActive) throw new Error("Admin not approve..!");
    const isValidPassword = await bcrypt.compare(
      req.body.password,
      validUser.password
    );
    if (!isValidPassword) throw new Error("unauthorized! Try again..!");
    // SET Cookies & Sign The JWT Token
    const tokenPayload = {
      id: validUser._id,
      role: validUser.role,
      avatar: validUser.avatar,
      name: validUser.name,
      createdAt: validUser.createdAt,
      updatedAt: validUser.updatedAt,
    };
    const token = jwt.sign(tokenPayload, process.env.USER_SECRET, {
      expiresIn: "24h",
    });
    // console.log(token);
    res.cookie("user_token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 2, // 2Days
      httpOnly: true,
    });
    // REDIRECT TO PROTECT PAGE
    res.redirect("/");
  } catch (error) {
    console.log(error?.message);
    return res.render("user/login", {
      error: { message: error?.message },
      title: "Login Page",
      flashMsg: {
        error: req.flash("error"),
        success: req.flash("success"),
        warn: req.flash("warn"),
      },
      value: req.body,
      url: req.url,
    });
  }
};
/*==============REGISTER-SECTION================*/
const renderUserRegister = (req, res) => {
  if (req.cookies && req.cookies["user_token"]) {
    return res.redirect("/");
  }
  res.render("user/register", {
    error: "",
    title: "Register Page",
    value: "",
    url: req.url,
  });
};
// REGISTER
const userRegister = async (req, res) => {
  try {
    const payload = req.body;
    // console.log(payload);
    const v = new Validator(payload, {
      name: "required|string|minLength:3",
      email: "required|string|minLength:3",
      password: "required|string|minLength:5",
      cPassword: "required|string|minLength:5",
    });
    const matched = await v.check();
    if (!matched) {
      // console.log(v.errors);
      return res.render("user/register", {
        error: v.errors,
        title: "Register Page",
        value: req.body,
        url: req.url,
      });
    }
    // Check Email already Exist OR NOT
    const isEmail = await UserModel.findOne({ email: req.body.email });
    // console.log(isEmail);
    if (isEmail) {
      return res.render("user/register", {
        error: {
          email: { message: "Email already exist.!" },
        },
        title: "Register Page",
        value: req.body,
        url: req.url,
      });
    }
    // Check Both password word are same
    if (req.body.password !== req.body.cPassword) {
      return res.render("user/register", {
        error: {
          password: { message: "both password not same!" },
          cPassword: { message: "both password not same!" },
        },
        title: "Register Page",
        value: req.body,
        url: req.url,
      });
    }
    // create has password
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    // save to DATA BASE
    const newUser = new UserModel({ ...req.body, password: hashPassword });
    const user = await newUser.save();
    const tokenPayload = {
      id: user._id,
      role: user.role,
      avatar: user.avatar,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    const token = generateUserToken(tokenPayload);
    await sendingEmail(req, user, token);
    // RESPONSE SEND TO THE CLIENT
    return res.redirect("/login");
  } catch (error) {
    console.log(error?.message);
    return res.render("user/register", {
      error,
      title: "Login Page",
      value: "",
      url: req.url,
    });
  }
};
/*==============DASHBOARD-SECTION================*/
const renderLanding = (req, res) => {
  if (req.cookies && !req.cookies["user_token"]) {
    return res.redirect("/user/login");
  }
  return res.render("user/", {
    title: "index page",
    user: req.user,
    url: req.url,
  });
};
module.exports = {
  renderUserLogin,
  userLogin,
  renderUserRegister,
  userRegister,
  renderLanding,
};
