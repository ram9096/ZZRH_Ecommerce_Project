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

export const offerValidation = Joi.object({
  
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name must be less than 100 characters"
    }),
  type: Joi.string()
    .valid("PRODUCT", "CATEGORY")
    .required()
    .messages({
      "any.only": "Offer type must be PRODUCT or CATEGORY",
      "string.empty": "Offer type is required"
    }),


  discountType: Joi.string()
    .valid("PERCENTAGE", "FLAT")
    .required()
    .messages({
      "any.only": "Discount type must be PERCENTAGE or FLAT",
      "string.empty": "Discount type is required"
    }),

  discountValue: Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": "Discount value must be a number",
      "number.positive": "Discount value must be greater than 0",
      "any.required": "Discount value is required"
    }),

  maxDiscount: Joi.number()
    .min(0)
    .optional()
    .messages({
      "number.base": "Max discount amount must be a number",
      "number.min": "Max discount amount cannot be negative"
    }),

  startDate: Joi.date()
    .required()
    .messages({
      "date.base": "Start date must be a valid date",
      "any.required": "Start date is required"
    }),

  endDate: Joi.date()
    .greater(Joi.ref("startDate"))
    .required()
    .messages({
      "date.base": "End date must be a valid date",
      "date.greater": "End date must be after start date",
      "any.required": "End date is required"
    }),

  isActive: Joi.boolean().optional()
});

export const couponValidation = Joi.object({
  code: Joi.string()
    .pattern(/^[A-Z0-9]{5,10}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Coupon code must be 5–10 characters long and contain only uppercase letters and numbers",
      "string.empty": "Coupon code is required"
    }),

  discountType: Joi.string()
    .valid("PERCENTAGE", "FLAT")
    .required(),

  discountValue: Joi.number()
    .positive()
    .required(),

  minOrderValue: Joi.number()
    .min(0)
    .default(0),

  maxDiscount: Joi.when("discountType", {
    is: "PERCENTAGE",
    then: Joi.number().positive().required(),
    otherwise: Joi.number().optional().allow(null)
  }),

  expiryDate: Joi.date()
    .greater("now")
    .required(),

  usageLimit: Joi.number()
    .integer()
    .min(1)
    .default(1),

  isActive: Joi.boolean().default(true)
});
