const express = require("express");
const {
  renderLoginPage,
  renderRegisterPage,
  renderDashboard,
  login,
  register,
  renderAllUsers,
  switchStatusOfUser,
} = require("../../controller/admin/adminController");
const { isAdmin } = require("../../middleware/auth/isAdmin");
const {
  renderAddCoursesPage,
  addCourses,
  renderAllCoursePage,
  switchStatusOfCourse,
} = require("../../controller/admin/adminCoursesController");
const {
  renderAddPostPage,
  addPost,
  renderAllPostPage,
  switchStatusOfPost,
} = require("../../controller/admin/adminPostController");
const { upload } = require("../../utility/fileUploadForCourse");
const { postUpload } = require("../../utility/fileUploadForPost");

const adminRoute = express.Router();

adminRoute.get("/login", renderLoginPage); // ADMIN LOGIN RENDER
adminRoute.post("/login", login); // ADMIN LOGIN

adminRoute.get("/register", renderRegisterPage); // ADMIN LOGIN RENDER
adminRoute.post("/register", register); // ADMIN REGISTER

adminRoute.get("/dashboard", isAdmin, renderDashboard); // RENDER DASHBOARD

adminRoute.get("/users", isAdmin, renderAllUsers); // RENDER ALL USER PAGE

adminRoute.get("/add-courses", isAdmin, renderAddCoursesPage); // RENDER ADD COURSES PAGE
adminRoute.get("/all-courses", isAdmin, renderAllCoursePage); // RENDER ALL COURSES PAGE

adminRoute.get("/add-post", isAdmin, renderAddPostPage); // RENDER ADD POST PAGE
adminRoute.get("/all-posts", isAdmin, renderAllPostPage); // RENDER ALL POST PAGE

adminRoute.get("/activate-user/:id", isAdmin, switchStatusOfUser); // USER ACTIVE INACTIVE
adminRoute.get("/activate-course/:id", isAdmin, switchStatusOfCourse); // COURSE ACTIVE INACTIVE
adminRoute.get("/activate-post/:id", isAdmin, switchStatusOfPost); // COURSE ACTIVE INACTIVE

// POST
adminRoute.post("/add-courses", isAdmin, upload.single("banner"), addCourses); //  ADD COURSES
adminRoute.post("/add-post", isAdmin, postUpload.single("banner"), addPost); //  ADD POST

/*==============ACTIVE-USER================*/
adminRoute.get("/is-active", (req, res) => res.send("ok"));

module.exports = adminRoute;
