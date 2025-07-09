const Joi = require('joi');
const { title } = require('process');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("", null),

        // Allows both single string and array of strings.
        // Each string must be one of the valid category values.
        category: Joi.alternatives().try(
            Joi.string().valid(
                "Trending", "Rooms", "Farms", "Iconic cities", "Beach", "Greenry",
                "Amazing pools", "Snow city", "Mountain", "Camping", "Sailing", "Hiking"
            ),
            Joi.array().items(Joi.string().valid(
                "Trending", "Rooms", "Farms", "Iconic cities", "Beach", "Greenry",
                "Amazing pools", "Snow city", "Mountain", "Camping", "Sailing", "Hiking"
            ))
        ).optional()
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        comment: Joi.string().required(),
        rating: Joi.number().required().min(1).max(5)
    }).required()
});

