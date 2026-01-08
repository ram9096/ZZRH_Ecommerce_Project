import Joi from "joi";

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