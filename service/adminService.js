import userModel from "../model/userModel.js";
import categoryModel from "../model/categoryModel.js"
import productModel from "../model/productModel.js"
import variantModel from "../model/variantModel.js"
import dotenv from"dotenv"
import mongoose from "mongoose";
dotenv.config()



export const adminLoginLogic = (name,password)=>{
    if(process.env.ADMIN_NAME == name&&process.env.ADMIN_PASSWORD == password){
        return {success:true}
    }
    return {success:false,message:"CREDENTIAL INVALID"}
}

export const adminUsersLogic = async(filter,pageNo,sort)=>{
    try{
        const page = parseInt(pageNo)||1
        const limit = 5
        const skip = (page-1)*limit
        const total = await  userModel.countDocuments()
        const totalPages = Math.ceil(total/limit)


        let tempUserProgress = await userModel
            .find(filter)
            .skip(skip)
            .limit(limit)
            .sort(sort)
        
        return {success:true,data:tempUserProgress,currentPage: page,totalPages:totalPages,totalUser:total,}

    }catch(e){
        
        return {success:false,message:"ERROR WHILE LOADING USER"}
    }
}
export const dataLoad = async(filter)=>{
    let tempCategoryProgress = await categoryModel.find(filter)
    if(!tempCategoryProgress){
        return {success:false,message:"ERROR WHILE LOADING DATA"}
    }
    return{success:true,data:tempCategoryProgress}
}


export const adminUserEditLogic = async(status,id)=>{
    const tempUserProgress = await userModel.findOne({_id:id})
    if(status === ''){
        return {success:false}
    }
    if(!tempUserProgress){
        return {success:false,message:"USER DOESN'T EXIST"}
    }
    tempUserProgress.isActive = status
    await tempUserProgress.save()
    return{success:true}
}
export const productModelLoad = async (filter,sort,pageNo)=>{
    const page = parseInt(pageNo)||1
    const limit = 5
    const skip = (page-1)*limit
    const total = await  productModel.countDocuments()
    const totalPages = Math.ceil(total/limit)

    let products = await productModel.find(filter)
        .populate('categoryId')
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
    if(!products){
        return {success:false}
    }
    return {success:true,data:products,currentPage: page,totalPages:totalPages,totalUser:total}
} 
export const variantLoad = async(filter)=>{

    let variants = await variantModel.find(filter)
        .populate('productId')
    if(!variants){
        return {success:false}
    } 
    return {success:true,data:variants}
}

export const categoryModelLoad = async(filter,sort,pageNo)=>{
    const page = parseInt(pageNo)||1
    const limit = 5
    const skip = (page-1)*limit
    const total = await  categoryModel.countDocuments()
    const totalPages = Math.ceil(total/limit)
    let tempCategoryProgress = await categoryModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
    if(!tempCategoryProgress){
        return {success:false,message:"ERROR WHILE LOADING DATA"}
    }
    return{success:true,data:tempCategoryProgress,currentPage: page,totalPages:totalPages,totalUser:total}
}
