import { couponValidation } from "../../Joi Validation/validation.js";
import couponModel from "../../model/couponModel.js";

export const couponFormCreateLogic = async (code,type,value,validity,limit,max)=>{
    try{

        const { error, result } = couponValidation.validate({ code,discountType:type,discountValue:value,expiryDate:validity,usageLimit:limit,maxDiscount:max }, {
            abortEarly: false
        });
        if(error){
            return {
                success: false,
                message: error.details.map(e => e.message)
            }
        }

        let couponExist = await couponModel.findOne({code,discountType:type})

        if(couponExist){
            return {
                success: false,
                message: "Coupon exist error"
            }
        }

        let newCoupon = new couponModel({
            code:code,
            discountType:type,
            discountValue:value,
            expiryDate:validity,
            usageLimit:limit,
            maxDiscount:max
        })

        await newCoupon.save()

        return {
            success:true,
            message:"Coupon created"
        }
    }catch(e){
        console.log(e)
        return {
            success:false,
            message:"Server error"
        }
    }
}

export const couponFormEditLogic = async (_id,code,type,value,validity,limit,max)=>{
    try{

        const { error, result } = couponValidation.validate({ code,discountType:type,discountValue:value,expiryDate:validity,usageLimit:limit,maxDiscount:max }, {
            abortEarly: false
        });
        if(error){
            return {
                success: false,
                message: error.details.map(e => e.message)
            }
        }

        let couponExist = await couponModel.findOne({_id})

        if(!couponExist){
            return {
                success: false,
                message: "Error try again!!"
            }
        }

        couponExist.code = code
        couponExist.discountType = type
        couponExist.discountValue = value
        couponExist.expiryDate = validity
        couponExist.maxDiscount = limit

        await couponExist.save()

        return {
            success:true,
            message:"Coupon created"
        }
    }catch(e){
        console.log(e)
        return {
            success:false,
            message:"Server error"
        }
    }
}

export const couponFetcher = async(filter,page = 1 ,limit = 0)=>{
    try{

        let skip = (page-1)*limit

        const data = await couponModel.find(filter)
            .skip(skip)
            .limit(limit)
        const total = await couponModel.countDocuments(filter)

        if(!data){
            return {
                success:false,
                message:"Error while loading"
            }
        }

        return {
            success:true,
            data:data,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                total
            }
        }
    }catch(e){
        console.log(e)
        return {
            success:false,
            message:"Server error"
        }
    }
}