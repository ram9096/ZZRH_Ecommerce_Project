import userModel from "../model/userModel.js";
import productModel from "../model/productModel.js"
import variantModel from "../model/variantModel.js"
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sentOtp } from "../utils/otpMailing.js";

export const findUserByEmail = (email) => userModel.findOne({ email });

export const userLoginLogic = async (email, password) => {
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
};

export const registerService = async (name, email, password, mobileno) => {
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
};

export const generateOtp = async (email) => {
    try {
        let user = await findUserByEmail(email);
        if (!user) return { success: false };

        const otp = crypto.randomInt(100000, 999999).toString();
        console.log("OTP:", otp);

        user.otp = bcrypt.hashSync(otp, 10);
        user.otpExpires = Date.now() + 3 * 60 * 1000;
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

export const ProductsLoad = async ()=>{
    let products = await variantModel.find()
        .populate('productId')
    if(!products){
        return {success:false,message:"ERROR WHILE LOADING DATA"}
    }
    return {success:true,data:products}
}