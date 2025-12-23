import mongoose from "mongoose";
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
    }
    // referralCode:{
    //     type:String
    // },
    // referredBy:{
    //     type:mongoose.Schema.Types.ObjectId,

    // }
},
{
    timestamps: true
})

export default mongoose.model('Users',userSchema)