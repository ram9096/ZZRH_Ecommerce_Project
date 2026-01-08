import userModel from "../model/userModel.js";
import categoryModel from "../model/categoryModel.js"
import productModel from "../model/productModel.js"
import variantModel from "../model/variantModel.js"
import dotenv from"dotenv"
import mongoose from "mongoose";
import { productSchemaValidate } from "../Joi Validation/validation.js";
dotenv.config()



export const adminProductsAddLogic =  async(name,category,description,status,variant)=>{
    try{

        const {error} = productSchemaValidate.validate(
            {
                name,
                category,
                description,
                variant
            }
        )

        if(error){

            return {
                success:false,
                message:error.details.map(d => d.message)
            }
        }

        let tempProductProgress = await productModel.findOne({name})
        
        if(tempProductProgress){

            return {
                success:false,
                message:"PRODUCT ALREADY EXIST"
            }
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

            let tempVariantProgress = await variantModel.findOne({

                productId:_id,
                color:variant[i].color,
                size:variant[i].size
            })

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
        return {
            success:true
        }
    }catch(error){
         console.error("Server error :\n", error);
        return { 
            success: false, 
            message: "Internal server error" 
        };
    }
}



export const adminProductEditLogic = async(productData,variant,id)=>{
    try{
        
        const data = {
            
            name:productData.productName,
            categoryId:productData.category,
            description:productData.description
        }
        const {error} = productSchemaValidate.validate(
            {
                name:data.name,
                category:data.categoryId,
                description:data.description,
                variant
            }
        )
        if(error){

            return {
                success:false,
                message:error.details.map(d => d.message)
            }

        }

        await productModel.findByIdAndUpdate({_id:id},data)

        for(let key in variant){

             if(variant[key]._id == ''){

                let tempVariantProgress = await variantModel.findOne({
                    productId:id,
                    color:variant[key].color,
                    size:variant[key].size
                })

                if(tempVariantProgress){
                    
                    return {
                        success:false,
                        message:"VARIANT ALREADY EXIST"
                    }
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

            const existingVariant = await variantModel.findOne({
                _id:variant[key]._id
            })

            if(!existingVariant) continue;

            let images = existingVariant.image

            for(let img in variant[key].image){
                images[Number(img)] = variant[key].image[img]
            }
            await variantModel.findByIdAndUpdate(variant[key]._id,{
                SKU:variant[key].sku,
                color:variant[key].color,
                size:variant[key].size,
                stock:variant[key].stock,
                discount:variant[key].discount,
                price:variant[key].price,
                status:variant[key].status =='true',
                image:images
            })
            
        }
        return {success:true}

    }catch(e){
        console.log("Error from server: \n",e)

        return {
            success:false,
            message:"SERVER ERROR"
        }
    }
}