import userModel from "../model/userModel.js";
import categoryModel from "../model/categoryModel.js"
import productModel from "../model/productModel.js"
import variantModel from "../model/variantModel.js"
import dotenv from"dotenv"
dotenv.config()



export const adminLoginLogic = (name,password)=>{
    if(process.env.ADMIN_NAME == name&&process.env.ADMIN_PASSWORD == password){
        return {success:true}
    }
    return {success:false,message:"CREDENTIAL INVALID"}
}

export const adminUsersLogic = async(filter)=>{
    let tempUserProgress = await userModel.find(filter)
    if(!tempUserProgress){
        return {success:false,message:"ERROR WHILE LOADING USER"}
    }
    return {success:true,data:tempUserProgress}
}
export const dataLoad = async(filter)=>{
    let tempCategoryProgress = await categoryModel.find(filter)
    if(!tempCategoryProgress){
        return {success:false,message:"ERROR WHILE LOADING DATA"}
    }
    return{success:true,data:tempCategoryProgress}
}
export const adminCategoryAddLogic = async(category_name,description,status)=>{
    let tempCategoryProgress = await categoryModel.findOne({category_name})
    
    if(tempCategoryProgress){
        return {success:false,message:"CATEGORY ALREADY EXIST"}
    }
    let newCategory = new categoryModel({
        categoryName:category_name,
        description:description,
        isActive:status
    })
    await newCategory.save()
    return {success:true}
}
export const adminCategoryEditLogic = async(_id,category_name,description,status)=>{
    let tempCategoryProgress = await categoryModel.findOne({_id})
    if(!tempCategoryProgress){
        return {success:false,message:"ERROR WHILE EDITING THE CATEGORY"}
    }
    tempCategoryProgress.categoryName = category_name
    tempCategoryProgress.description = description
    tempCategoryProgress.isActive = status
    await tempCategoryProgress.save()
    return{success:true,message:"CATEGORY UPDATED"}
}
export const adminProductsAddLogic =  async(name,category,sku,description,price,offer,status,variant)=>{
    let tempProductProgress = await productModel.findOne({name})
    if(tempProductProgress){
        return {success:false,message:"PRODUCT ALREADY EXIST"}
    }
    let newProduct = new productModel({
        offerId:offer,
        name:name,
        description:description,
        price:price,
        status:status,
        SKU:sku,
        categoryId:category,
    })
    
    await newProduct.save()
    tempProductProgress = await productModel.findOne({name})
    let _id = tempProductProgress._id
    for(let i in variant){
        let tempVariantProgress = await variantModel.findOne({productId:_id,color:variant[i].color,size:variant[i].size})
        if(tempVariantProgress){
            return {success:false,message:"VARIANT ALREADY EXIST"}
        }
        let newVariant = new variantModel({
            productId:_id,
            color:variant[i].color,
            size:variant[i].size,
            stock:variant[i].stock,
            SKU:sku,
            image:variant[i].images
        })
        await newVariant.save()
    }
    return {success:true}
}
export const adminUserEditLogic = async(status,id)=>{
    const tempUserProgress = await userModel.findOne({_id:id})
    if(!tempUserProgress){
        return {success:false,message:"USER DOESN'T EXIST"}
    }
    tempUserProgress.isActive = status
    await tempUserProgress.save()
    return{success:true}
}
export const productModelLoad = async ()=>{
    let user = await productModel.find()
        .populate('categoryId')
    if(!user){
        return {success:false}
    }
    return {success:true,data:user}
} 