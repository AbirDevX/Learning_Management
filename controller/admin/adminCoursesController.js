const { StatusCodes } = require("http-status-codes");
const { HttpException } = require("../../config/httpException");
const { destroyAFile } = require("../../utility/toDestroyAFile");
const { Validator } = require("node-input-validator");
const CoursesModel = require("../../model/coursesModel");

const renderAddCoursesPage = async (req, res) => {
  if (req.cookies && !req.cookies["admin_token"]) {
    return res.redirect("/admin/login");
  }
  try {
    return res.render("admin/addCourses", {
      error: "",
      flashMsg: { msg: req.flash("msg") },
      title: "Add Courses Page",
      value: "allActiveCourses",
      admin: req.admin,
      url: req.url,
    });
  } catch (error) {
    console.log(error?.message);
    return res.redirect("/admin/login");
  }
};
/*==============ADD-SINGLE-COURSES================*/
const addCourses = async (req, res) => {
  const banner = req.file;
  const payload = req.body;

  try {
    // console.log(payload);
    const adminId = req?.admin?.id;
    const role = {
      tropic: "required|string",
      description: "required|string",
      price: "required|integer",
      courseDuration: "required|string",
      scheduleTime: "required|string",
      scheduleLocation: "required|string",
      scheduleDay1: "string|required",
      scheduleDay2: "string|required",
      scheduleDay3: "string|required",
    };
    const v = new Validator(payload, role);
    const matched = await v.check();
    if (!matched) {
      banner && destroyAFile(banner.filename);
      // console.log(v.errors);
      return res.render("admin/addCourses", {
        error: v.errors,
        title: "Register Page",
        value: req.body,
        admin: req.admin,
        url: req.url,
      });
    }
    const model = new CoursesModel({
      ...payload,
      adminId,
      banner: banner?.filename,
      schedule: {
        days: [
          payload?.scheduleDay1,
          payload?.scheduleDay2,
          payload?.scheduleDay3,
        ],
        time: payload?.scheduleTime,
        location: payload?.scheduleLocation,
      },
    });
    // console.log(model);
    await model.save();
    req.flash("msg", "Course added successFully.");
    return res.redirect("/admin/all-courses");
  } catch (error) {
    console.log(error?.message);
    banner && destroyAFile(banner.filename);
    return res.redirect("/admin/login");
  }
};
const renderAllCoursePage = async (req, res) => {
  if (req.cookies && !req.cookies["admin_token"]) {
    return res.redirect("/admin/login");
  }
  try {
    const courses = await CoursesModel.find();
    return res.render("admin/allCourse", {
      error: "",
      title: "All Course Page",
      courses,
      admin: req.admin,
      url: req.url,
    });
  } catch (error) {
    console.log(error?.message);
    return res.redirect("/admin/login");
  }
};
const switchStatusOfCourse = async (req, res) => {
  try {
    if (!req.params.id)
      throw new httpException(StatusCodes.BAD_REQUEST, "Bad Request..!");
    const prevValue = await CoursesModel.findById(req.params.id);
    const updatedData = await CoursesModel.findByIdAndUpdate(req.params.id, {
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

module.exports = { addCourses, renderAddCoursesPage, renderAllCoursePage, switchStatusOfCourse };
