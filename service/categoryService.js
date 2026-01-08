import categoryModel from "../model/categoryModel.js"
import productModel from "../model/productModel.js"
import variantModel from "../model/variantModel.js"
import dotenv from"dotenv"
import mongoose from "mongoose";
import { categorySchemaValidate } from "../Joi Validation/validation.js";
dotenv.config()


export const adminCategoryAddLogic = async(categoryName,description,isActive)=>{
    try{
        const { error } = categorySchemaValidate.validate({
            categoryName,
            description,
            isActive
        })

        if(error){

            return {
                success:false,
                message:error.details.map(d=>d.message)
            }
        }
        let tempCategoryProgress = await categoryModel.findOne({

            categoryName:{
                $regex:categoryName,
                $options:"i"
            }
        })
    
        if(tempCategoryProgress){

            return {
                success:false,
                message:"Sorry Category already exist!!"
            }
        }
        let newCategory = new categoryModel({
            categoryName,
            description,
            isActive
        })

        await newCategory.save()
        return {success:true}

    }catch(e){

        console.log("Server Error: ",e)
        return {
            success:false,
            message:"SERVER ERROR OR THE CATEGORY ALL READY EXIST"
        }
    }
}


export const adminCategoryEditLogic = async(_id,categoryName,description,isActive)=>{
    try{
        
        const { error } = categorySchemaValidate.validate({

            categoryName,
            description,
            isActive
        })

        if(error){

            return {
                success:false,
                message:error.details.map(d=>d.message)
            }
        }

        let tempCategoryProgress = await categoryModel.findByIdAndUpdate(_id,
            {
                categoryName,
                description,
                isActive
            }
        )

        if(!tempCategoryProgress){
            return {
                success:false,
                message:"Sorry Error while editing!!"
            }
        }

        return{
            success:true,
            message:"Category updated"
        }
    }catch(e){
        
        console.log("Server error",e)
        return {
            success:false,
            message:"SERVER ERROR"
        }
    }
}
