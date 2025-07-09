const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing, upload } = require("../middleware.js");
const ListingControllers = require("../controllers/listings.js");

// INDEX : main route...view all listings
router.get("/", wrapAsync(ListingControllers.index));

// CREATE : add new listing
router.get("/new", isLoggedIn, ListingControllers.renderNewForm);
router.post("/", isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(ListingControllers.addNewListing));

// SEARCH
router.get('/search', wrapAsync(ListingControllers.searchListing));

// FILTER
router.get("/filter/:category", wrapAsync(ListingControllers.filterByCategory));

// READ : view single listing
router.get("/:id", wrapAsync(ListingControllers.showListing));

// UPDATE : update specific listing
router.get("/edit/:id", isLoggedIn, isOwner, wrapAsync(ListingControllers.renderUpdateForm));
router.put("/:id", isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(ListingControllers.updateListing));

// DELETE : delete a listing
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(ListingControllers.deleteListing));

module.exports = router;