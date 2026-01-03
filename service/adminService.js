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
export const adminCategoryAddLogic = async(category_name,description,status)=>{
    try{
        if(category_name.length<3
            ||!/^[A-Za-z]+( [A-Za-z]+)*$/.test(category_name)
        ){
            return {success:false,message:"LENGTH ERROR"}
        }
        if(description.length==0||description.length<5||description.length>300||!/^[A-Za-z]+( [A-Za-z]+)*$/.test(description)){
            return {success:false,message:"DESCRIPTION ERROR"}
        }
        if(status==''){
            return {success:false,message:"STATUS ERROR"}
        }
        let tempCategoryProgress = await categoryModel.findOne({categoryName:{$regex:category_name,$options:"i"}})
    
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
    }catch(e){
        console.log("Server Error: ",e)
        return {success:false,message:"SERVER ERROR OR THE CATEGORY ALL READY EXIST"}
    }
}
export const adminCategoryEditLogic = async(_id,category_name,description,status)=>{
    try{
        
        if(category_name.length<3
            ||!/^[A-Za-z]+( [A-Za-z]+)*$/.test(category_name)
        ){
            return {success:false,message:"DATA ERROR"}
        }
        if(description.length==0||description.length<5||description.length>300||!/^[A-Za-z]+( [A-Za-z]+)*$/.test(description)){
            return {success:false,message:"DATA ERROR"}
        }
        let tempCategoryProgress = await categoryModel.findOne({_id})
        if(!tempCategoryProgress){
            return {success:false,message:"ERROR WHILE EDITING THE CATEGORY"}
        }
        tempCategoryProgress.categoryName = category_name
        tempCategoryProgress.description = description
        tempCategoryProgress.isActive = status
        await tempCategoryProgress.save()
        return{success:true,message:"CATEGORY UPDATED"}
    }catch(e){
        console.log("Server error",e)
        return {success:false,message:"SERVER ERROR"}
    }
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
        // if(sku.length==0){
        //     return {success:false,message:"SKU  error from server"}
        // }
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
                status:status,
                size:variant[i].size,
                stock:variant[i].stock,
                price:variant[i].price,
                SKU:variant[i].sku,
                image:variant[i].images,
                discount:variant[i].discount
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

export const adminProductEditLogic = async(productData,variant,id)=>{
    try{
        if(!productData.productName||!/^[A-Za-z]+( [A-Za-z]+)*$/.test(productData.productName)){
            return {success:false,message:"Name error from server"}
        }
        if(productData.category === ""||productData.category.toUpperCase() == 'SELECT CATEGORY'){
            return {success:false,message:"Category error from server"}
        }
        if(productData.description.length==0||productData.description.length<5||productData.description.length>300){
            return {success:false,message:"description error from server"}
        }
        console.log(productData,id)
        const data = {
            name:productData.productName,
            categoryId:productData.categoryId,
            description:productData.description
        }
        await productModel.findByIdAndUpdate({_id:id},data)
        for(let key in variant){
             if(variant[key]._id == ''){
                let tempVariantProgress = await variantModel.findOne({productId:id,color:variant[key].color,size:variant[key].size})
                if(tempVariantProgress){
                    return {success:false,message:"VARIANT ALREADY EXIST"}
                }
                let images = []
                for(let img in variant[key].image){
                    images.push(variant[key].image[img])
                }
                let newVariant = new variantModel({
                    productId: id,
                    color:variant[key].color,
                    status:true,
                    size:variant[key].size,
                    stock:variant[key].stock,
                    price:variant[key].price,
                    SKU:variant[key].sku,
                    image:images,
                    discount:variant[key].discount
                })
                await newVariant.save()
                continue;
            }
            const existingVariant = await variantModel.findOne({_id:variant[key]._id})
            if(!existingVariant) continue;
            let images = existingVariant.image
            for(let img in variant[key].image){
                images[Number(img)] = variant[key].image[img]
            }
            await variantModel.findByIdAndUpdate(variant[key]._id,{
                color:variant[key].color,
                size:variant[key].size,
                stock:variant[key].stock,
                price:variant[key].price,
                status:variant[key].status!=='true',
                image:images
            })
            
        }
        return {success:true}

    }catch(e){
        console.log(e)
        return {success:false,message:"SERVER ERROR"}
    }
}