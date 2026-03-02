import mongoose from "mongoose";
import { type } from "os";
let schema  = mongoose.Schema

const userSchema = new schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true   // allows users without googleId
    },
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    mobileNo:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    },
    status:{
        type:Boolean,
        default:true
    },
    otp:{
        type:String
    },
    otpExpires:{
        type:Date
    },
    wallet:{
        type:Number,
        default:0
    }
},
{
    timestamps: true
})

export default mongoose.model('Users',userSchema)