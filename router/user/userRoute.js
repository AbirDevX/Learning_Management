const { isAuthorized } = require("../../middleware/auth/isAuthorized");
const express = require("express");
const {
  renderUserLogin,
  renderUserRegister,
  userLogin,
  userRegister,
  renderLanding,
} = require("../../controller/user/userController");
const { confirmationToLogin } = require("../../controller/user/authController");
const {
  renderAllCourses,
  renderSingleCourse,
  byCourse,
} = require("../../controller/user/useCoursesController");
const { renderAllPost, renderSinglePostPage, addComment, addLike } = require("../../controller/user/postController");

const userRoute = express.Router();

/*===================USER-Login=========================*/
userRoute.get("/login", renderUserLogin);
userRoute.post("/login", userLogin);

/*==============USER-Register================*/
userRoute.get("/register", renderUserRegister);
userRoute.post("/register", userRegister);

/*==============VERIFY-USER================*/
userRoute.get("/user/confirmation/:email/:token", confirmationToLogin);
/*============== PAGES ================*/
userRoute.get("/", isAuthorized, renderLanding); // Landing Page
/*============== COURSES ================*/
userRoute.get("/courses", isAuthorized, renderAllCourses); // Render All-Courses Page
userRoute.get("/courses/:id", isAuthorized, renderSingleCourse); // Render Single-Courses Page
userRoute.patch("/buy-course", isAuthorized, byCourse); // buy course Page
/*============== BLOGS ================*/
userRoute.get("/posts", isAuthorized, renderAllPost); // render all blogs
userRoute.get("/post/:id", isAuthorized, renderSinglePostPage); // render single 
userRoute.post("/comment/:id", isAuthorized, addComment); // ADD COMMENT 
userRoute.patch("/add-like/:id", isAuthorized, addLike); // ADD COMMENT 



module.exports = userRoute;
