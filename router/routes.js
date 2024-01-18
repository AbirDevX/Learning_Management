const express = require("express");
const adminRoute= require("./admin/adminRoute");
const userRoute= require("./user/userRoute");

// ROUTER OBJECT
const routes = express.Router();
// STORE ALL ROUTE WITH PREFIX
const defaultRoute = [{ path: "/", router: userRoute },{ path: "/admin", router: adminRoute }];
defaultRoute.forEach((routeItem) => {
  routes.use(routeItem.path, routeItem.router);
});

module.exports = routes;
