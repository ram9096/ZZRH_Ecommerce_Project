
//Page renderings

import { AddressAddLogic, addressDelete, addressFetcher, emailEditLogic, PasswordEditLogic, usernameEditLogic } from "../service/userProfileService.js"
import { findUserByEmail, generateOtp } from "../service/userService.js"

export const userProfileLoad = async (req,res)=>{
    try{
        
        if (!req.session.user || !req.session.user.email) {
            return res.redirect('/login')
        }

        let userDetails = await findUserByEmail(req.session.user.email)

        if(!userDetails){
            return res.redirect('/login')
        }

        return res.render('User/user-profile',{
            isLogged:req.session.user||'',
            name:userDetails.username,
            email:userDetails.email,
            mobile:userDetails.mobileNo
        })
    }catch(e){
        console.log("Data sharing error :\n",e)
        return res.status(500).redirect('/login')
    }
}

export const userNameEditLoad = async (req,res)=>{
    try{

        if (!req.session.user || !req.session.user.email) {
            return res.redirect('/login')
        }

        let userDetails = await findUserByEmail(req.session.user.email)

        if(!userDetails){
            return res.redirect('/login')
        }

        return res.render('User/user-profile-edit',{
            isLogged:req.session.user||'',
            name:userDetails.username,
            email:userDetails.email,
            mobile:userDetails.mobileNo
        })
    }catch(e){
        console.log("Data sharing error :\n",e)
        return res.status(500).redirect('/login')
    }
}


export const userEmailEditLoad = async(req,res)=>{
    try{
        if (!req.session.user || !req.session.user.email) {
            return res.redirect('/login')
        }

        let userDetails = await findUserByEmail(req.session.user.email)

        if(!userDetails){
            return res.redirect('/login')
        }

        return res.render('User/user-email-edit',{

            isLogged:req.session.user||'',
            name:userDetails.username,
            email:userDetails.email,
            mobile:userDetails.mobileNo,
            otpVerified: req.session.otpContext == "EMAIL_VERIFIED" || false

        })
    }catch(e){
        console.log("Data sharing error :\n",e)
        return res.status(500).redirect('/login')
    }
}


export const userPasswordEditLoad = async (req,res)=>{
    try{

        let userDetails = await findUserByEmail(req.session.user.email)
        
        return res.render('User/user-password-edit',{
            isLogged:req.session.user||'',
            name:userDetails.username,
            email:userDetails.email,
            mobile:userDetails.mobileNo,
            otpVerified: req.session.otpContext == "PASSWORD_VERIFIED" || false
        })
    }catch(e){
        console.log("Data sharing error :",e)
        return res.status(500).redirect('/login')
    }
}


export const userAddressLoad = async (req,res)=>{
    try{

        let userDetails = await findUserByEmail(req.session.user.email)
        let address = await addressFetcher(userDetails._id)
        
        return res.render('User/user-address-page',{
            isLogged:req.session.user||'',
            name:userDetails.username,
            email:userDetails.email,
            mobile:userDetails.mobileNo,
            address:address
        })
        
    }catch(e){
       console.log("Data sharing error :",e)
        return res.status(500).redirect('/login') 
    }
}
//Controllers --------------

export const userNameEdit  = async (req,res)=>{
    try{
        const {username} = req.body

        const id = req.session.user.id
        
        const progress = await usernameEditLogic(username,id)
        
        if(!progress.success){
            return res.status(401).json({
                success:false,
                message:progress.message
            })
        }
        return res.json({
            success:true,
            redirect:'/profile'
            
        })
        
    }catch(e){
        console.log(e)
        res.status(500).json({
            success:false,
            message:"Data sharing error try again"
        })
    }
}

export const userEmailEdit = async (req,res)=>{
    try{
        
        const { email } = req.body

        if(!email){
            return res.status(401).json({
                success:false,
                message:"Invalid email address"
            })
        }
        if(req.session.otpContext != "EMAIL_VERIFIED"){

            req.session.tempEmail = email
            req.session.otpContext = "EMAIL_EDIT"
    
            await generateOtp(email)
            
            return res.status(201).json({
                success:true,
                redirect:"/verify-otp"
            });
        
        }
        const id = req.session.user.id
        if(!id){
            return res.status(401).json({
                success:false,
                message:"Error while editing email address"
            })
        }
        const emailEditProgress = await emailEditLogic(id,email)

        if(!emailEditProgress.success){
            return res.status(401).json({
                success:false,
                message:emailEditProgress.message
            })
        }
        req.session.otpContext = null
        req.session.user = null
        return res.json({
            success:true,
            redirect:"/login"
        })
        
    }catch(e){

        console.log(e)
        res.status(500).json({
            success:false,
            message:"Data sharing error try again"
        })
    }
}

export const userPasswordEdit = async (req,res)=>{
    try{
        const {password} = req.body
    
        if(!password){
             return res.status(401).json({

                success:false,
                message:"Error while editing Password"
            })
        }

        const id = req.session.user.id,email = req.session.user.email
        
        if(!id||!email){

             return res.status(401).json({
            
                success:false,
                message:"Error while editing Password"
            
            })
        }
        if(req.session.otpContext != "PASSWORD_VERIFIED"){

            let userDetails = await PasswordEditLogic(id,password,"PASSWORD_CHECK")
            if(!userDetails.success){
                return res.status(401).json({
                
                    success:false,
                    message:userDetails.message
                
                })
            }
            
    
            req.session.tempEmail = email
            req.session.otpContext = "PASSWORD_EDIT"
            await generateOtp(email)
    
            return res.status(201).json({
                success:true,
                redirect:"/verify-otp"
            });

        }

        let userDetails = await PasswordEditLogic(id,password,'PASSWORD_CHANGE')
        
        if(!userDetails.success){

            return res.status(401).json({
                success:false,
                message:userDetails.message
            })
        }
        req.session.otpContext = null
        req.session.user = null
        return res.json({
            success:true,
            redirect:"/login"
        })

    }catch(e){
        console.log("Data sharing error :",e)
        res.status(500).json({
            success:false,
            message:"Data sharing error try again!!!"
        })
    }
}

export const userAddressAdd = async(req,res)=>{
    try{

        const { 
            id,
            username,
            phone,
            pincode,
            city,
            state,
            landmark,
            country,
            street,
            isDefault,
            purpose
        } = req.body

        const addressAddingProgress = await AddressAddLogic(
            id,
            username,
            phone,
            pincode,
            city,
            state,
            landmark,
            country,
            street,
            isDefault
        )
        
        if(!addressAddingProgress.success){
            return res.json({
                success:false,
                message:addressAddingProgress.message
            })
        }
        if(purpose == "NEW"){

            req.session.user.addressId = addressAddingProgress.id
            
            return res.json({
                success:true,
                redirect:"/checkout/method"
            })
        }
        return res.json({
            success:true,
            redirect:"/profile/address-management"
        })

    }catch(e){
        console.log("Data sharing error :",e)
        res.status(500).json({
            success:false,
            message:"Data sharing error try again!!!"
        })
    }
}


export const userAddressDelete = async (req,res)=>{
    try{
        const id = req.params.id
        
        const addressDeleteProgress = await addressDelete(id)
        if(!addressDeleteProgress.success){

            return res.status(401).json({
                success:false,
                message:"Delete error!!"
            })
        }
        return res.json({
            success:true,
            redirect:"/profile/address-management"
        })

    }catch(e){
        console.log("Data sharing error :",e)
        res.status(500).json({
            success:false,
            message:"Data sharing error try again!!!"
        })
    }
}