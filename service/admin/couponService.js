import { couponValidation } from "../../Joi Validation/validation.js";
import couponModel from "../../model/couponModel.js";
import orderModel from "../../model/orderModel.js";

export const couponFormCreateLogic = async (code,type,value,validity,limit,max,purchase)=>{
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
            maxDiscount:max,
            minOrderValue:purchase
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

export const couponFormEditLogic = async (_id,code,type,value,validity,limit,max,purchase)=>{
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
        couponExist.usageLimit = limit
        couponExist.maxDiscount = max
        couponExist.minOrderValue = purchase
        
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
            .sort({_id:-1})
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

export const calculateDiscount = (price,coupon)=>{
    let discount = 0;
    
    if(coupon.discountType == "PERCENTAGE"){
        discount = (price*coupon.discountValue)/100
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
        }
    }else{
        discount = coupon.discountValue
    }
    return discount
}

export const couponApplyLogic = async (code,total)=>{
    try{

        if(!code||!total){
            return {
                success:false,
                message:"error try again"
            }
        }

        const coupon = await couponModel.findOne({code:code,isActive:true})

        if(!coupon){
            return {
                success:false,
                message:"Code is not active"
            }
        }

        if(coupon.usageLimit <= 0){
            return {
                success: false,
                message: "Coupon expired"
            };
        }

        if(coupon.expiryDate < new Date()){
            
            return {
                success: false,
                message: "Coupon expired"
            };
        }
        if(typeof total == "string"){
            total = Number(total.replace('₹',''))
        }
        if(total<coupon.minOrderValue){
            
            return {
                success: false,
                message: `Minimum purchase amount is ${coupon.minOrderValue}`
            };
        }
        if(!coupon.baseLimit){
            coupon.baseLimit = coupon.usageLimit
        }
        coupon.usageLimit = coupon.usageLimit - 1

        await coupon.save()
        const discount = calculateDiscount(total,coupon)
        
        return {
            success:true,
            discount:discount,
            message:"Coupon applied"
        }
        
    }catch(e){
        console.log(e)
        return {
            success:false,
            message:"Server error"
        }
    }
}