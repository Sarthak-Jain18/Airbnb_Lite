if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

//EXPRESS
const express = require("express");
const app = express();

//MONGOOSE
const mongoose = require('mongoose');
// const MONGO_URL = 'mongodb://127.0.0.1:27017/airbnb';
const db_url = process.env.ATLAS_DB_URL;
main()
    .then(() => { console.log("connection successful"); })
    .catch(err => console.log(err));
async function main() {
    await mongoose.connect(db_url);
    // await mongoose.connect(MONGO_URL);
}

//METHOD-OVERRIDE
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

//PATH
const path = require("path");

//PARSING
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//VIEWS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../client/views"));

//PUBLIC
app.use(express.static(path.join(__dirname, "../client/public")));

//EJS-MATE
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);

// ROUTER
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// AUTHENTICATION, AUTHORIZATION
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// EXPRESS-SESSION, MONGO SESSION
const store = MongoStore.create({
    mongoUrl: db_url,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600
});

store.on("error", () => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};
app.use(session(sessionOptions));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// FLASH
const flash = require("connect-flash");
const { error } = require('console');
app.use(flash());

//  LOCALS
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

//PORT
let port = 8080;
app.listen(port, () => {
    console.log(`server started at port : ${port}`);
});

// LISTINGS
app.use("/listings", listingRouter);

// REVIEWS
app.use("/listings/:id/reviews", reviewRouter);

// USERS
app.use("/", userRouter);

// 404 Handler
app.use((req, res) => {
    const message = "Page Not Found!"
    res.status(404).render("listings/error.ejs", { message });
});

// Error handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Oops...something went wrong!" } = err;
    res.status(statusCode).render("listings/error.ejs", { message });
});



