import { offerValidation } from "../../Joi Validation/validation.js"

import offerModel from "../../model/offerModel.js"


export const offerDataLoad = async ()=>{
    try{
        let data = await offerModel.find()

        if(!data){
            return {
                success:false,
                message:"Error while loading data"
            }
        }
        return {
            success:true,
            data:data
        }
    }catch(e){
        console.log(e)
        return {
            success:false,
            message:"Error while loading data"
        }
    }
}

export const offerAddLogic = async (
    name,
    discountType,
    discountValue,
    minOrderAmount,
    startDate,
    endDate,
    type
)=>{
    try{

        const { error, value } = offerValidation.validate( {
            name,
            discountType,
            discountValue,
            minOrderAmount,
            startDate,
            endDate,
            type
        } ,{ abortEarly: false });
       
        if (error) {
        
            const messages = error.details.map(err => err.message);
            return {
                success: false,
                message: messages,

            };
        }
        
        let newOffer  = new offerModel({
            name,
            discountType,
            discountValue,
            startDate,
            endDate,
            minOrderAmount,
            type
        })
        await newOffer.save()

        
        return {
            success:true,
            message:"Offer added"
        }
        
    }catch(e){

        console.log(e)
        return {

            success: false,
            message: "Server error",

        };
    }
}