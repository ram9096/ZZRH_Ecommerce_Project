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
export const adminProductsAddLogic =  async(name,category,sku,description,status,variant)=>{
    try{
        if(!name||!/^[A-Za-z]+( [A-Za-z]+)*$/.test(name)){
            return {success:false,message:"Name error from server"}
        }
        if(category === ""||category.toUpperCase() == 'SELECT CATEGORY'){
            return {success:false,message:"Category error from server"}
        }
        if(description.length==0||description.length<5||description.length>100){
            return {success:false,message:"description error from server"}
        }
        if(sku.length<12){
            return {success:false,message:"SKU  error from server"}
        }
        if(variant.length==0){
            return {success:false,message:"Variant error from server"}
        }

        let tempProductProgress = await productModel.findOne({name})
        
        if(tempProductProgress){
            return {success:false,message:"PRODUCT ALREADY EXIST"}
        }
        let newProduct = new productModel({
            name:name,
            description:description,
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
                price:variant[i].price,
                SKU:sku,
                image:variant[i].images
            })
            await newVariant.save()
        }
        return {success:true}
    }catch(error){
         console.error("Server validation error:", error);
        return { success: false, message: "Internal server error" };
    }
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