const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const UserControllers = require("../controllers/users.js");

// SIGN-UP (register)
router.get("/signup", UserControllers.renderSignupForm);
router.post("/signup", wrapAsync(UserControllers.Signup));

// LOG-IN
router.get("/login", UserControllers.renderLoginForm);
router.post("/login", saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), wrapAsync(UserControllers.Login));

// LOG-OUT
router.get("/logout", UserControllers.Logout);

module.exports = router;
