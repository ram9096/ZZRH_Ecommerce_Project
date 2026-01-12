import Joi from "joi";
import mongoose from "mongoose";

export const variantSchemaValidate = Joi.object({
    color:Joi.string().trim().min(1).required(),
    size: Joi.string().trim().min(1).required(),
    stock: Joi.number().integer().min(0).required(),
    price: Joi.number().positive().required(),
    sku: Joi.string().trim().required(),
    images: Joi.array().items(Joi.string()).min(1).required(),
    discount: Joi.number().min(0).default(0)
}) 

export const productSchemaValidate = Joi.object({
    name: Joi.string()
        .pattern(/^[A-Za-z]+([ '-][A-Za-z]+)*$/)
        .required()
        .messages({
            "string.pattern.base":
                "Name can contain letters, spaces, hyphens (-), and apostrophes (') only"
        }),

    category: Joi.string()
        .invalid("","SELECT CATEGORY")
        .required(),

    description: Joi.string()
        .min(5)
        .max(300)
        .required(),
    
    variant:Joi.object().min(1).required()
})

export const categorySchemaValidate = Joi.object({
    categoryName: Joi.string().trim().min(1).required(),
    description:Joi.string()
        .min(1)
        .max(300)
        .required(),
    isActive:Joi.boolean().required()
})

export const addressSchemaValidate = Joi.object({
    userId: Joi.string()
        .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error("any.invalid");
        }
        return value;
        })
        .required(),
    username:Joi.string()
        .min(1)
        .max(200)
        .required(),
    phone_number:Joi.number()
        .integer()
        .required(),
    street_address: Joi.string()
        .min(5)
        .required(),

    landmark:Joi.string()
        .allow("")
        .optional(),

    city:Joi.string()
        .required(),

    state:Joi.string()
        .required(),

    postal_code:Joi.number()
        .integer()
        .required(),

    country:Joi.string()
        .required(),
    isDefault:Joi.boolean().required()
})