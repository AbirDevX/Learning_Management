const express = require("express");
const dotEnv = require("dotenv");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { join } = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const {dbConnection}= require("./config/dbConfig");
const routes = require("./router/routes");
const {notFoundHandler, defaultErrorHandler}= require("./middleware/common/errorHandler");

const app = express();

dotEnv.config({ path: ".dev.env" });
//THIRD PARTY MIDDLEWARE
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());
app.use(session({ secret: "anything", cookie: { maxAge: 5000 }, resave: false, saveUninitialized: false }));
// View Engine
app.set("view engine", "ejs");
// PUBLIC ROUTE
app.use(express.static(join(__dirname,"/public/")));
app.use(express.static(join(__dirname,"/uploads/")));
// DB CONNECTION
dbConnection();
// ROUTE
app.use(routes);
// NOT FOUND HANDLER
app.use(notFoundHandler);
// ERROR HANDLER
app.use(defaultErrorHandler);

// LISTENING SERVER
app.listen(process.env.PORT,()=> console.log(`YOUR SERVER STARED ON: http://localhost:${process.env.port}/`))