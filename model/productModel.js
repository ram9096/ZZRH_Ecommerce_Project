import mongoose from "mongoose";

let schema = mongoose.Schema

const productSchema = new schema({
    offerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Offer"
    },
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true

    },
    status:{
        type:Boolean,
        required:true
    },
    SKU:{
        type:String,
        required:true
    },
    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    }
},{timestamps:true})

export default mongoose.model("Product",productSchema)