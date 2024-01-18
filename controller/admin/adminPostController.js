const { StatusCodes } = require("http-status-codes");
const { httpException } = require("../../config/httpException");
const { Validator } = require("node-input-validator");
const { PostModel } = require("../../model/postModel");
const {
  destroyAFile,
  destroyPostBanner,
} = require("../../utility/toDestroyAFile");
const CoursesModel = require("../../model/coursesModel");

const renderAddPostPage = async (req, res) => {
  if (req.cookies && !req.cookies["admin_token"]) {
    return res.redirect("/admin/login");
  }
  try {
    return res.render("admin/addPost", {
      error: "",
      title: "Add Post Page",
      value: "",
      admin: req.admin,
      url: req.url,
    });
  } catch (error) {
    console.log(error?.message);
    return res.redirect("/admin/login");
  }
};

/*==============ADD-SINGLE-COURSES================*/
const addPost = async (req, res) => {
  const banner = req.file;
  const payload = req.body;
  try {
    // console.log(payload);
    const v = new Validator(payload, {
      title: "required|string",
      subTitle: "required|string",
      description: "required|string",
    });
    const matched = await v.check();
    if (!matched) {
      // console.log(v.errors);
      return res.render("admin/addPost", {
        error: v.errors,
        title: "Add Post Page",
        value: req.body,
        admin: req.admin,
        url: req.url,
      });
    }
    const postModel = new PostModel({
      ...payload,
      banner: banner?.filename,
      adminId: req.admin.id,
    });
    await postModel.save();
    req.flash("success", "Post added successFully.");
    return res.redirect("/admin/all-posts");
  } catch (error) {
    banner && destroyPostBanner(banner.filename);
    req.flash("error", "Post add Failed. try again..!");
    return res.redirect("/admin/all-posts");
  }
};
const renderAllPostPage = async (req, res) => {
  if (req.cookies && !req.cookies["admin_token"]) {
    return res.redirect("/admin/login");
  }
  try {
    const posts = await PostModel.find();
    return res.render("admin/allPosts", {
      error: "",
      flashMsg: {
        error: req.flash("error"),
        msg: req.flash("msg"),
        success: req.flash("success"),
      },
      title: "All Post Page",
      posts,
      admin: req.admin,
      url: req.url,
    });
  } catch (error) {
    console.log(error?.message);
    return res.redirect("/admin/login");
  }
};
const switchStatusOfPost = async (req, res) => {
  try {
    if (!req.params.id)
      throw new httpException(StatusCodes.BAD_REQUEST, "Bad Request..!");
    const prevValue = await PostModel.findById(req.params.id);
    const updatedData = await PostModel.findByIdAndUpdate(req.params.id, {
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
  renderAddPostPage,
  addPost,
  renderAllPostPage,
  switchStatusOfPost,
};
