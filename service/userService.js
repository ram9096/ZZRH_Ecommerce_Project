import userModel from "../model/userModel.js";
import productModel from "../model/productModel.js"
import variantModel from "../model/variantModel.js"
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sentOtp } from "../utils/otpMailing.js";
import { pipeline } from "stream";
import categoryModel from "../model/categoryModel.js";

export const findUserByEmail = (email) => userModel.findOne({ email });

export const userLoginLogic = async (email, password) => {
    try{
        let user = await findUserByEmail(email);
        if (!user) {
            return { success: false, message: "USER NOT FOUND" };
        }
        let passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return { success: false, message: "CREDENTIALS NOT MATCH" };
        }
        if(user.status == false){
            return {success:false,message:"OTP NOT VERIFIED",data:user}
        
        }
        if(user.isActive == false){
            return {success:false,message:"USER IS CURRENTLY BLOCKED"}
        }

        return { success: true, data: user };
    }catch(e){
        console.log("Server error",e)
        return {success:false,message:"SERVER ERROR"}
    }
};

export const registerService = async (name, email, password, mobileno) => {
    try{
        if(!/^[A-Za-z]+( [A-Za-z]+)*$/.test(name)||name.length<3){
            return {success:false,message:"USERNAME ERROR FROM SERVER"}
        }
        if(!/^[a-zA-Z0-9](?!.*\.\.)[a-zA-Z0-9._]{4,28}[a-zA-Z0-9]@gmail\.com$/.test(email)){
            return {success:false,message:"EMAIL ERROR FROM SERVER"}
        }
        if(/(.)\1{2,}/.test(password)||password.length<6){
            return {success:false,message:"PASSWORD ERROR FROM SERVER"}
        }
        if(mobileno.length<10||/^(\d)\1{9}$/.test(mobileno)||!/^[0-9]{10}$/.test(mobileno)){
            return {success:false,message:"MOBILE NUM ERROR FROM SERVER"}

        }
        let existingUser = await findUserByEmail(email);

        if (existingUser) {
            return { success: false, message: "USER ALREADY EXISTS" };
        }

        let hashedPassword = await bcrypt.hash(password, 10);

        let newUser = new userModel({
            username: name,
            password: hashedPassword,
            email,
            mobileNo: mobileno,
            status: false,
            isActive:true
        });

        await newUser.save();
        return { success: true, data: newUser };
    }catch(e){
        console.log("Server error ",e)
        return {success:false,message:"SERVER ERROR"}
    }
};

export const generateOtp = async (email) => {
    try {
        let user = await findUserByEmail(email);
        if (!user) return { success: false };

        const otp = crypto.randomInt(100000, 999999).toString();
        console.log("OTP:", otp);

        user.otp = bcrypt.hashSync(otp, 10);
        user.otpExpires = Date.now() + 30 * 1000;
        await user.save();
        await sentOtp(email, otp);
        return { success: true, data: user };
    } catch (e) {
        console.log("OTP Error:", e);
        return { success: false };
    }
};

export const verifyOtpLogic = async (email, otp) => {
    let user = await findUserByEmail(email);
    if (!user) {
        return { success: false, message: "USER DOESN'T EXIST" };
    }
    if (!user.otp || !user.otpExpires) {
        return { success: false, message: "OTP NOT GENERATED" };
    
    }

    if (user.otpExpires < Date.now()) {
        return { success: false, message: "OTP EXPIRED" };
    
    }
    let validOtp = await bcrypt.compare(otp, user.otp);
    if (!validOtp) {
        return { success: false, message: "INVALID OTP" };
    }

    user.status = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    return { success: true, data: user };
};


export const emailVerificationLogic = async(email)=>{
    let user = await findUserByEmail(email)
    if(!user){
        return {success:false,message:"USER DOESN'T EXIST"}
    }
    return {success:true,data: user} 
}

export const forgotPasswordLogic = async(email,password)=>{
    let user = await findUserByEmail(email)
    if(!user){
        return {success:false,message:"USER DOESN'T EXIST"}
    }
    let hashedPassword = await bcrypt.hash(password,10)
    user.password = hashedPassword
    await user.save()
    return {success:true,data:user}
}

export const ProductsLoad = async (filter,limit = null)=>{
    let color = new Set([...(await variantModel.find()).map(v=>v.color)])
    let size = new Set([...(await variantModel.find()).map(v=>v.size)])
    const pipeline = [
        {
            $lookup:{
                from:"products",
                localField:"productId",
                foreignField:"_id",
                as:"products"
            }
        },
        {$unwind:"$products"},
        {
            $lookup:{
                from:"categories",
                localField:"products.categoryId",
                foreignField:"_id",
                as:"category"
            }
        },
        {$unwind:"$category"},
        {
            $match:{
                "category.isActive":true
            }
        },
        {$match:filter}
    ]
    if(limit){
        pipeline.push({$limit:limit})
    }
    let products = await variantModel.aggregate(pipeline)
    let category = await categoryModel.find()
    //let color = products.map(products=>products.color)
    if(!products){
        return {success:false,message:"ERROR WHILE LOADING DATA"}
    }
    return {success:true,data:products,color:color,size:size,category:category}
}

export const ProductvariantDetails = async(id,Variantcolor,Variantsize)=>{
    try{
        const product =  await productModel.findById(id)
        const color = (await variantModel.find({productId:id})).map(v=>v.color)
        const size  = (await variantModel.find({productId:id})).map(v => v.size)
        const variants= await variantModel.find({productId:id})
        let variant = null
        if(variants.length==0){
            return {success:false,message:"PRODUCT DOESN'T EXIST"}
        } 
        if (Variantcolor && Variantsize) {
        variant = variants.find(
            v => v.color === Variantcolor && v.size === Variantsize
        )
        }

        if (!variant && Variantsize) {
        variant = variants.find(v => v.size === Variantsize)
        }

        if (!variant && Variantcolor) {
        variant = variants.find(v => v.color === Variantcolor)
        }

        if (!variant) {
        variant = variants[0]
        }

        
        return {success:true,product,variant,color,size}
    }catch(e){
        console.log("Error: ",e)
        return{success:false,message:"SERVER ERROR"}
    }
}
export const variantFilterLogic = async(filter)=>{
    try{
        const data = await variantModel.findOne(filter)
        if(!data){
            return {success:false,message:"No variant exist"}
        }
        return {success:true,data:data}
    }catch(e){
        console.log("Server error ",e)
        return{success:false,message:"SERVER ERROR"}
    }
}