
import mongoose, { Types } from "mongoose";
let schema = mongoose.Schema

let addressSchema = new schema({
    userId:{
        type:mongoose.Types.ObjectId,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    phone_number:{
        type:Number,
        required:true,
    },
    street_address:{
        type:String,
        required:true
    },
    landmark:{
        type:String,
        required:false
    },
    city:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    postal_code:{
        type:Number,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    isDefault:{
        type:Boolean,
    }

},{timestamps:true})

export default mongoose.model("Address",addressSchema)