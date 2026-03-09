import userModel from "../model/userModel.js";
import categoryModel from "../model/categoryModel.js"
import productModel from "../model/productModel.js"
import variantModel from "../model/variantModel.js"
import dotenv from"dotenv"
import mongoose from "mongoose";
import { productSchemaValidate } from "../Joi Validation/validation.js";
import { calculateDiscount } from "./admin/couponService.js";
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


export const offerAddLogic = async (productId,offerId,type)=>{
    try{
        
        if(!productId||!offerId){
            return {
                success:false,
                message:"ID error try again"
            }
        }
        if(type == "CATEGORY"){

            const data = await categoryModel.findOne({_id:productId})
            

            if(offerId == "NO"){
                if (!data.offer) {
                    return {
                        success: true,
                        message: "No offer already applied to this category"
                    };
                }
                const product = await variantModel.aggregate([
                    {
                        $lookup: {
                            from: "products",
                            localField: "productId",
                            foreignField: "_id",
                            as: "product"
                        }
                    },
                    { $unwind: "$product" },
                    {
                        $match: {
                            "product.categoryId": new mongoose.Types.ObjectId(productId)
                        }
                    },
                    {
                        $lookup: {
                            from: "offers", 
                            localField: "product.offer",
                            foreignField: "_id",
                            as: "offer"
                        }
                    },

                    {
                        $unwind: {
                            path: "$offer",
                            preserveNullAndEmptyArrays: true 
                        }
                    }
                ]);

                for(let item of product){

                    if(item.appliedOffer?.toString() == data.offer._id.toString()){

                        await variantModel.updateOne(
                            { _id:item._id},
                            {
                                $set:{
                                    price:item.basePrice,
                                    appliedOffer:null
                                }
                            }
                        )
                    }

                }

                if(data.offer!=null){
                    
                    data.offer = null
                }    
                await data.save()

                return {
                    success:true,
                    message:"Offer canceled for the category"
                }
            }

            data.offer = offerId

            await data.save()
            await applyOffer(productId,"CATEGORY")
            return {
                success:true,
                message:"Offer added successfully"
            }


        }

        if(offerId == "NO"){
            const data = await productModel.findOne({_id:productId})
            const variant = await variantModel.find({
                productId:productId
            })

            for(let i of variant){
                if(i.appliedOffer?.toString() == data.offer._id.toString()){

                    await variantModel.updateOne(
                        {_id:i._id},
                        {
                            $set:{
                                price:i.basePrice,
                                appliedOffer:null
                            }
                        }
                    )
                }
            }
            
            if(data.offer!=null){
                data.offer = null
                
            }   
             
            await data.save()

            return {
                success:true,
                message:"Offer canceled for the product"
            }
        }

        const data = await productModel.findOne({_id:productId})
        data.offer = offerId

        await data.save()
        await applyOffer(productId,"PRODUCT")
        return {
            success:true,
            message:"Offer added successfully"
        }

    }catch(e){

        console.log("Error: ",e)
        return {
            success:false,
            message:"ID error try again"
        }
 
    }
}

const validateOffer = (offer) => {

    if (!offer) return false;

    if (!offer.isActive) return false;

    const now = new Date();

    if (offer.startDate && offer.startDate > now) return false;

    if (offer.endDate && offer.endDate < now) return false;

    if (offer.usageLimit && offer.usedCount >= offer.usageLimit) return false;

    return true;
};



export const applyOffer = async (_id,action)=>{
    try{

        if(action == "CATEGORY"){
            const data = await categoryModel.findOne({_id})
                .populate("offer")
            
            const product = await variantModel.aggregate([
                {
                    $lookup: {
                        from: "products",
                        localField: "productId",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                { $unwind: "$product" },
                {
                    $match: {
                        "product.categoryId": new mongoose.Types.ObjectId(_id)
                    }
                },
                 {
                    $lookup: {
                        from: "offers", 
                        localField: "product.offer",
                        foreignField: "_id",
                        as: "offer"
                    }
                },

                {
                    $unwind: {
                        path: "$offer",
                        preserveNullAndEmptyArrays: true 
                    }
                }
            ]);
            for (let item of product) {

                let productDiscountValue = 0;
                let categoryDiscountValue = 0;

                const basePrice = item.basePrice || item.price;
                
                if(!item.basePrice){
            
                    await variantModel.updateOne(
                        { _id: item._id },
                        {
                            $set: {
                                basePrice:item.price
                            }
                        }
                    );
                    item.basePrice = item.price
                }
              
                if (validateOffer(data.offer)) {
                    categoryDiscountValue = calculateDiscount(basePrice, data.offer);
                }

               
                if (validateOffer(item.product.offer)) {
                    productDiscountValue = calculateDiscount(basePrice, item.product.offer);
                }

                console.log("CATEGORY:", categoryDiscountValue, productDiscountValue);

                
                const bestDiscount = Math.max(categoryDiscountValue, productDiscountValue);

                let appliedOfferId = null;

                if (bestDiscount === categoryDiscountValue && categoryDiscountValue > 0) {
                    appliedOfferId = data.offer?._id;
                } 
                else if (bestDiscount === productDiscountValue && productDiscountValue > 0) {
                    appliedOfferId = item.product.offer?._id;
                }

                const finalPrice = Math.max(basePrice - bestDiscount, 0);

                await variantModel.updateOne(
                    { _id: item._id },
                    {
                        $set: {
                            price: finalPrice,
                            appliedOffer: appliedOfferId
                        }
                    }
                );
            }


            return;

        }

        if(action == "PRODUCT"){

            const product = await variantModel.aggregate([
                {
                    $match: {
                        productId: new mongoose.Types.ObjectId(_id)
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "productId",
                        foreignField: "_id",
                        as: "productId"
                    }
                },
                { $unwind: "$productId" },
                {
                    $lookup: {
                        from: "categories",
                        localField: "productId.categoryId",
                        foreignField: "_id",
                        as: "productId.categoryId"
                    }
                },
                {
                    $unwind: {
                        path: "$productId.categoryId",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "offers",
                        localField: "productId.categoryId.offer",
                        foreignField: "_id",
                        as: "productId.categoryId.offer"
                    }
                },
                {
                    $unwind: {
                        path: "$productId.categoryId.offer",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "offers",
                        localField: "appliedOffer",
                        foreignField: "_id",
                        as: "appliedOffer"
                    }
                },
                {
                    $unwind: {
                        path: "$appliedOffer",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "offers",
                        localField: "productId.offer",
                        foreignField: "_id",
                        as: "productId.offer"
                    }
                },
                {
                    $unwind: {
                        path: "$productId.offer",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "offers",
                        localField: "offer",
                        foreignField: "_id",
                        as: "offer"
                    }
                },
                {
                    $unwind: {
                        path: "$offer",
                        preserveNullAndEmptyArrays: true
                    }
                }
            ]);

            
            for(let item of product){

                let productDiscountValue = 0
                let categoryDiscountValue = 0

                if(!item.basePrice){
            
                    await variantModel.updateOne(
                        { _id: item._id },
                        {
                            $set: {
                                basePrice:item.price
                            }
                        }
                    );
                    item.basePrice = item.price
                }

                if(validateOffer(item.productId.offer)){

                    productDiscountValue = calculateDiscount(item.basePrice,item.productId.offer)
                }

                if(validateOffer(item.productId.categoryId.offer)){

                    categoryDiscountValue = calculateDiscount(item.basePrice,item.productId.categoryId.offer)
                }

                if(categoryDiscountValue>productDiscountValue){

                    await variantModel.updateOne(
                        { _id: item._id },
                        {
                            $set: {
                                price: item.basePrice - categoryDiscountValue,
                                appliedOffer: item.productId.categoryId.offer._id
                            }
                        }
                    );

                }else{

                    await variantModel.updateOne(
                        { _id: item._id },
                        {
                            $set: {
                                price: item.basePrice - productDiscountValue,
                                appliedOffer: item.productId.offer._id
                            }
                        }
                    );

                }
            }

            return
        }
        
        

    }catch(e){
        console.log(e)
    }
}