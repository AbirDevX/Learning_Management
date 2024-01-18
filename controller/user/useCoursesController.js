const HttpErrorException = require("../../config/httpException");
const { StatusCodes } = require("http-status-codes");
const CoursesModel = require("../../model/coursesModel");
const UserModel = require("../../model/userModel");

/*==============RENDER-ALL-COURSES================*/
const renderAllCourses = async (req, res) => {
  if (req.cookies && !req.cookies["user_token"]) {
    return res.redirect("/login");
  }
  try {
    const courses = await CoursesModel.find({ isActive: true });
    return res.render("user/courses", {
      error: "",
      title: "Courses Page",
      value: "",
      courses,
      user: req.user,
      url: req.url,
    });
  } catch (error) {
    console.log(error?.message);
    return res.redirect("/login");
  }
};
const renderSingleCourse = async (req, res) => {
  const param = req.params;
  if (req.cookies && !req.cookies["user_token"]) {
    return res.redirect("/login");
  }
  try {
    if (!param.id) throw new Error("Bad Request");
    const course = await CoursesModel.findOne({
      _id: param.id,
      isActive: true,
    });
    const relatedCourse = await CoursesModel.find({
      isActive: true,
      _id: { $ne: param.id },
    });
    return res.render("user/courses/singleCourse", {
      error: "",
      title: "Courses Page",
      course,
      relatedCourse,
      user: req.user,
      url: req.url,
    });
  } catch (error) {
    console.log(error?.message);
    return res.redirect("/login");
  }
};
const byCourse = async (req, res) => {
  const payload = req.body;
  try {
    if (req.cookies && !req.cookies["user_token"]) {
      return res.redirect("/login");
    }
    const user = await UserModel.findById(payload.userId);
    const course = await CoursesModel.findById(payload.courseId);
    if (!user || !course)
      throw HttpErrorException(StatusCodes.NOT_FOUND, "NOT_FOUND");
    if (!user.coursesIds.includes(course._id)) {
      await UserModel.findByIdAndUpdate(user._id, {
        $push: { coursesIds: course._id },
      });
    }

    if (!course.purchaseIds.includes(user._id)) {
      await CoursesModel.findByIdAndUpdate(course._id, {
        $push: { purchaseIds: user._id },
      });
    }

    req.flash("success", "Purchase successFull.");
    return res
      .status(StatusCodes.OK)
      .json({ data: "success", status: StatusCodes.OK });
  } catch (error) {
    console.log(error);
    req.flash("error", "Failed to Purchase..!");
    return res
      .status(error?.status || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error?.message });
  }
};
module.exports = { renderAllCourses, renderSingleCourse, byCourse };
