import { addressSchemaValidate } from "../Joi Validation/validation.js";
import addressModel from "../model/addressModel.js";
import userModel from "../model/userModel.js";
import { findUserByEmail } from "./userService.js";
import bcrypt from "bcrypt"


export const addressFetcher = (userId=>addressModel.find({userId}))

export const usernameEditLogic = async(username,id)=>{
    try{
        const userDetails = await userModel.findByIdAndUpdate({_id:id},{
            username
        })
        if(!userDetails){
            return {
                success:false,
                message:"Error while editing"
            }
        }
        return {
            success:true,
            message:"Username successfully changed"
        }
    }catch(e){
        console.log("Service error :\n",e)
        return {
            success:false,
            message:"Server error"
        }
    }
}

export const emailEditLogic = async(_id,email)=>{
    try{

        const userDetails = await userModel.findByIdAndUpdate(_id,{
            email
        })
        if(!userDetails){
             return {
                success:false,
                message:"Error while editing"
            }
        }
        return {
            success:true,
            message:"email successfully changed"
        }
    }catch(e){

        console.log("Service error :\n",e)
        return {
            success:false,
            message:"Server error"
        }
    }
}

export const PasswordEditLogic = async ( _id,password,usecase)=>{
    try{
        const userDetails = await userModel.findById({_id})

        if(!userDetails){
            return {
                success:false,
                message:"Error while editing"
            }
        }

        let passwordCheck = await bcrypt.compare(password,userDetails.password)

        if(usecase == "PASSWORD_CHECK"){
            
            if(!passwordCheck){

                return {
                    success:false,
                    message:"Password doesn't match"
                }
            }

            return {
                success:true,
                message:"Password matched"
            }
        }else{

            if(passwordCheck){

                return{
                    success:false,
                    message:"Same as the old Password"
                }
            }
            let newPassword = await bcrypt.hash(password,10)
            userDetails.password = newPassword

            await userDetails.save()

            return {
                success:true,
                message:"Password changed"
            }
        }

    }catch(e){
        console.log("Server error: ",e)
        return {
            success:false,
            message:"Server error"
        }
    }
}

export const AddressAddLogic = async (username,phone_number,postal_code,city,state,landmark,country,street_address,isDefault)=>{

    try{

        let { error } = addressSchemaValidate.validate({
            userId:'6962caba7840015fd35dfa5d',
            username,
            phone_number,
            postal_code,
            city,
            state,
            street_address,
            landmark,
            country,
            isDefault
        })

        if(error){

            return {
                success:false,
                message:error.details.map(d => d.message)
            }
        }

        let addressExist = await addressModel.findOne({
            street_address,
            country,
            postal_code,
            city,
            state
        })

        if(addressExist){

            return {
                success:false,
                message:"Address already exist"
            }
        }

        let newAddress = new addressModel({
            
            userId:'6962caba7840015fd35dfa5d',
            username,
            phone_number,
            postal_code,
            city,
            state,
            street_address,
            landmark,
            country,
            isDefault
        })

        await newAddress.save()
        return {
            success:true,
            message:"Address added sucessfully"
        }

    }catch(e){
        console.log("Server error",e)
        return {
            success:false,
            message:"Server error"
        }
    }
}