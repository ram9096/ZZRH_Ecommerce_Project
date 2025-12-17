import mongoose from "mongoose";

let schema  = mongoose.Schema
let variantSchema = new schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },
    color:{
        type:String,
        required:true
    },
    size:{
        type:String,
        required:true
    },
    image:{
        type:[String]
    },
    stock:{
        type:Number,
        required:true
    },
    SKU:{
        type:String,
        required:true
    }
},{timestamps:true})

export default mongoose.model("Variant",variantSchema)