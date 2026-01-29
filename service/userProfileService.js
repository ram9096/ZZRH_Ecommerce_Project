import { addressSchemaValidate } from "../Joi Validation/validation.js";
import addressModel from "../model/addressModel.js";
import userModel from "../model/userModel.js";
import { findUserByEmail } from "./userService.js";
import bcrypt from "bcrypt"


export const addressFetcher = (userId=>addressModel.find({userId}))

export const addressIdFetcher = (_id=>addressModel.find({_id}))

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
        const emailExistChecking = await userModel.findOne({email})
        if(emailExistChecking){
            return {
                success:false,
                message:"Email already exist"
            }
        }
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

export const AddressAddLogic = async (_id,username,phone_number,postal_code,city,state,landmark,country,street_address,isDefault)=>{

    try{

        let { error } = addressSchemaValidate.validate({
            userId:_id,
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
            username,
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
            
            userId:_id,
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
        let address = await addressModel.findOne({
            username,
            street_address,
            country,
            postal_code,
            city,
            state
        })
        return {
            success:true,
            message:"Address added sucessfully",
            id:address._id
        }

    }catch(e){
        console.log("Server error",e)
        return {
            success:false,
            message:"Server error"
        }
    }
}

export const AddressEditLogic = async (userId,username,phone_number,postal_code,city,state,landmark,country,street_address,isDefault,_id)=>{
    try{
        
        if(!_id){

            return {
                success:false,
                message:"Id error try again!!"
            }
        }
        let { error } = addressSchemaValidate.validate({
            userId,
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
        let edit_address = await addressModel.findOne({_id,userId})
        
        if(!edit_address){

            return {
                success:false,
                message:"Address doesnt exist error"
            }
        } 
        edit_address.username = username
        edit_address.phone_number = phone_number
        edit_address.postal_code = postal_code
        edit_address.city = city
        edit_address.state = state
        edit_address.street_address = street_address
        edit_address.landmark = landmark
        edit_address.country = country
        edit_address.isDefault = isDefault

        await edit_address.save()

        return {
            success:true,
            message:"Successfully edited"
        }

    }catch(e){

        console.log("Server error",e)
        return {
            success:false,
            message:"Server error"
        }

    }
}

export const addressDelete = async ( id )=>{
    try{

        const exists = await addressModel.findById({_id:id})
        if(!exists){
            return {
                success:false,
                message:"Data error"
            }
        }
        await addressModel.deleteOne({_id:id})
        return {
            success:true,
            message:"Deleted successfully"
        }
    }catch(e){
        console.log("Server error",e)
        return {
            success:false,
            message:"Server error"
        }
    }
}