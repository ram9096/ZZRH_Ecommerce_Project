import { offerValidation } from "../../Joi Validation/validation.js"
import categoryModel from "../../model/categoryModel.js"

import offerModel from "../../model/offerModel.js"
import productModel from "../../model/productModel.js"
import variantModel from "../../model/variantModel.js"
import { applyOffer } from "../productService.js"


export const offerDataLoad = async (filter = {})=>{
    try{
        let data = await offerModel.find(filter)

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

export const offeredProducts = async ()=>{
    try{

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const data = await variantModel.find({
            appliedOffer: { $ne: null }
        })
            .populate({
                path: 'appliedOffer',
                match: {
                    isActive: true,
                    startDate: { $lte: today },
                    endDate: { $gte: today }
                }
            })
            .populate('productId');
        
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
    maxDiscount,
    startDate,
    endDate,
    type
)=>{
    try{

        const { error, value } = offerValidation.validate( {
            name,
            discountType,
            discountValue,
            maxDiscount,
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
            maxDiscount,
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

export const offerEditLogic = async (
    _id,
    name,
    discountType,
    discountValue,
    maxDiscount,
    startDate,
    endDate,
    type,
    isActive
)=>{
    try{

        const { error, value } = offerValidation.validate( {
            name,
            discountType,
            discountValue,
            maxDiscount,
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

        let offer = await offerModel.findByIdAndUpdate(_id,{
                name,
                discountType,
                discountValue,
                startDate,
                endDate,
                maxDiscount,
                type,
                isActive
            },
            { new: true }
        )

        if(isActive == false){
            let data = await variantModel.find({appliedOffer:_id})

            for(let item of data){
                await variantModel.findOneAndUpdate({_id:item._id},{price:item.basePrice})
            }
        }

        if(isActive){
            
            let data = await variantModel.find({appliedOffer:_id})

            for(let item of data){
                console.log(item._id)
                let apply = await applyOffer(item.productId,"PRODUCT")

                
            }   
        }

        if(!offer){

            return {
                success: false,
                message: "Try again",

            };
        }

        await offer.save()
        return {
            success:true,
            message:"Offer updated"
        }
        
    }catch(e){

        console.log(e)
        return {

            success: false,
            message: "Server error",

        };
    }
}

