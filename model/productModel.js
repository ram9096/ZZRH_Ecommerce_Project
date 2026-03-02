import mongoose from "mongoose";

let schema = mongoose.Schema

const productSchema = new schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true

    },
    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    },
    offer: {
        
        type: mongoose.Schema.Types.ObjectId,
        ref: "Offer",
        default: null
    }

},{timestamps:true})

export default mongoose.model("Product",productSchema)