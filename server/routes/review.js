const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isReviewAuthor, validateReview } = require("../middleware.js");
const ReviewControllers = require("../controllers/reviews.js");

// CREATE
router.post("/", isLoggedIn, validateReview, wrapAsync(ReviewControllers.createReview));

// DELETE : Review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(ReviewControllers.deleteReview));

module.exports = router;

