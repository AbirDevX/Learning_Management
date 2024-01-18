const httpException = require("../../config/httpException");
const bcrypt = require("bcrypt");
const { Validator } = require("node-input-validator");
const jwt = require("jsonwebtoken");
const UserModel = require("../../model/userModel");
const { UserEnum } = require("../../config/enum");
const { StatusCodes } = require("http-status-codes");

/*==============LOGIN-SECTION ================*/
const renderLoginPage = (req, res) => {
  if (req.cookies && req.cookies["admin_token"]) {
    return res.redirect("/admin/dashboard");
  }
  try {
    res.render("admin/login", {
      title: "home page",
      value: "",
      error: "",
      url: req.url,
    });
  } catch (error) {
    res.render("admin/login", {
      title: "home page",
      value: "",
      error: "",
      url: req.url,
    });
  }
};
// LOGIN
const login = async (req, res) => {
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
      return res.render("admin/login", {
        error: v.errors,
        title: "Login Page",
        value: req.body,
        url: req.url,
      });
    }
    // Check Valid Password
    const validUser = await UserModel.findOne({
      email: req.body.email,
      role: UserEnum.ADMIN,
    });
    if (!validUser) throw new Error("Not found! Try again..!");
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
    const token = jwt.sign(tokenPayload, process.env.ADMIN_SECRET, {
      expiresIn: "24h",
    });
    // console.log(token);
    res.cookie("admin_token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 2, // 2Days
      httpOnly: true,
    });
    // REDIRECT TO PROTECT PAGE
    res.redirect("/admin/dashboard");
    // return res.render("admin/login", {
    //   error: "",
    //   title: "Login Page",
    //   value: req.body,
    // });
  } catch (error) {
    console.log(error?.message);
    return res.render("admin/login", {
      error: { message: error?.message },
      title: "Login Page",
      value: req.body,
      url: req.url,
    });
  }
};
/*==============REGISTER-SECTION================*/
const renderRegisterPage = (req, res) => {
  if (req.cookies && req.cookies["admin_token"]) {
    return res.redirect("/admin/dashboard");
  }
  try {
    res.render("admin/register", {
      error: "",
      title: "Register Page",
      value: "",
      url: req.url,
    });
  } catch (error) {
    res.render("admin/register", {
      error: "",
      title: "Register Page",
      value: "",
      url: req.url,
    });
  }
};
// REGISTER
const register = async (req, res) => {
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
      return res.render("admin/register", {
        error: v.errors,
        title: "Register Page",
        value: req.body,
        url: req.url,
      });
    }
    /*============== Check Email already Exist OR NOT ================*/

    const isEmail = await UserModel.findOne({ email: req.body.email });
    // console.log(isEmail);
    if (isEmail) {
      return res.render("admin/register", {
        error: {
          email: { message: "Email already exist.!" },
        },
        title: "Register Page",
        value: req.body,
        url: req.url,
      });
    }

    /*============== Check Both password word are same ================*/

    if (req.body.password !== req.body.cPassword) {
      return res.render("admin/register", {
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
    await newUser.save();
    // console.log(newUser);
    // RESPONSE SEND TO THE CLIENT
    return res.redirect("/admin/login");
    // return res.render("admin/register", {
    //   error: "",
    //   title: "Register Page",
    //   value: req.body,
    // });
  } catch (error) {
    console.log(error?.message);
    return res.render("admin/register", {
      error,
      title: "Login Page",
      value: "",
      url: req.url,
    });
  }
};
/*==============DASHBOARD-SECTION================*/
const renderDashboard = (req, res) => {
  if (req.cookies && !req.cookies["admin_token"]) {
    return res.redirect("/admin/login");
  }
  try {
    res.render("admin/admindashboard", {
      title: "home page",
      admin: req.admin,
      url: req.url,
    });
  } catch (error) {
    res.send("something went wrong!");
  }
};
//
const renderAllUsers = async (req, res) => {
  if (req.cookies && !req.cookies["admin_token"]) {
    return res.redirect("/admin/login");
  }
  const users = await UserModel.find({ role: UserEnum.USER });
  res.render("admin/allUsers/", {
    title: "All User",
    admin: req.admin,
    users,
    url: req.url,
  });
};
//
const switchStatusOfUser = async (req, res) => {
  try {
    if (!req.params.id)
      throw new httpException(StatusCodes.BAD_REQUEST, "Bad Request..!");
    const prevValue = await UserModel.findById(req.params.id);
    const updatedData = await UserModel.findByIdAndUpdate(req.params.id, {
      isActive: !prevValue.isActive,
    });
    return res.status(StatusCodes.OK).json({
      message: "success",
      status: StatusCodes.OK,
      data: updatedData,
    });
  } catch (error) {
    console.log(error?.message);
    return res.status(error?.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "failed..!",
      status: error?.status || StatusCodes.INTERNAL_SERVER_ERROR,
      error: error,
    });
  }
};
module.exports = {
  renderLoginPage,
  renderRegisterPage,
  renderDashboard,
  login,
  register,
  renderAllUsers,
  switchStatusOfUser,
};
