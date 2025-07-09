const Listing = require("../models/listing.js");
const axios = require("axios");

module.exports.index = async (req, res, next) => {
    let listings = await Listing.find();
    res.render("listings/index.ejs", { listings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.addNewListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    let newListing = new Listing(req.body.listing);
    newListing.image = { url, filename };
    newListing.owner = req.user._id;
    if (newListing.category && !Array.isArray(newListing.category)) {
        newListing.category = [newListing.category];
    }
    await newListing.save();
    req.flash("success", "New listing added!");
    res.redirect("/listings");
};

module.exports.searchListing = async (req, res) => {
    const query = req.query.q?.trim();
    if (!query) {
        req.flash("error", "Please enter a search term");
        return res.redirect("/listings");
    }
    try {
        const listings = await Listing.find({
            title: { $regex: query, $options: "i" } // first letter or any part match
        });
        res.render("listings/index.ejs", { listings });
    } catch (err) {
        res.status(500).send("Server error");
    }
};

module.exports.filterByCategory = async (req, res) => {
    const { category } = req.params;
    if (category === "reset") {
        return res.redirect("/listings");
    }
    if (category === "Trending") {
        return res.redirect("/listings");
    }
    const listings = await Listing.find({ category });
    res.render("listings/index.ejs", { listings });
};

module.exports.showListing = async (req, res, next) => {
    let { id } = req.params;
    let showListing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!showListing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // Geocode the address using Nominatim
    const query = `${showListing.location}, ${showListing.country}`;
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

    let lat = null;
    let lon = null;

    try {
        const response = await axios.get(nominatimUrl, {
            headers: {
                "User-Agent": "ProjectAirbnbClone/1.0 (student@example.com)" // <- required!
            }
        });

        if (response.data.length > 0) {
            lat = response.data[0].lat;
            lon = response.data[0].lon;
        }
    } catch (err) {
        console.error("Nominatim geocoding error:", err.message);
    }

    res.render("listings/show", { showListing, lat, lon });

};

module.exports.renderUpdateForm = async (req, res, next) => {
    let { id } = req.params;
    let updateListing = await Listing.findById(id);
    if (!updateListing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { updateListing });
};

module.exports.updateListing = async (req, res, next) => {
    const { id } = req.params;
    const updatedData = req.body.listing;

    // Normalize category input
    if (updatedData.category && !Array.isArray(updatedData.category)) {
        updatedData.category = [updatedData.category];
    }
    if (!updatedData.category) {
        updatedData.category = ["Rooms"];   //default
    }

    // Update listing data
    let listing = await Listing.findByIdAndUpdate(id, updatedData, { new: true });

    // Update image if uploaded
    if (req.file) {
        const url = req.file.path;
        const filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res, next) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
};
