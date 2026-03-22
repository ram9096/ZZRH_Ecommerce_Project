import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import userModel from "../model/userModel.js"
import referalModel from "../model/referalModel.js"
import walletModel from "../model/walletModel.js"

export const passportConfigure = ()=>{
    passport.serializeUser(async(user,done)=>{
        done(null,user._id)
    })
    
    passport.deserializeUser(async(id,done)=>{
        try{
            const user = await userModel.findById(id)
            done(null,user)
        }catch(e){
            done(e,null)
        }
    })
    
    passport.use(
        new GoogleStrategy({ 
            clientID:process.env.CLIENT_ID,
            clientSecret:process.env.CLIENT_SECRET,
            callbackURL:"https://raftaara.in/auth/google/callback",
            passReqToCallback: true
        },
        async (req,accessToken,refreshToken,profile,done)=>{
            try{
                
                let user = await userModel.findOne({googleId:profile.id})
                if(user && !user.isActive){
                    return done(null, false, {
                        message: "User access is denied"
                    });
                }
                
                let ref = req.session.ref
                if(ref){
                    
    
                    let referalToken = await referalModel.findOne({token:ref,used:false})
                    
                    if(!referalToken){
        
                        return {
                            success:false,
                            message:"Link already used"
                        }
                    }
        
                    let user = await userModel.findOne({_id:referalToken.referrer})
                    
                    user.wallet+=50
                    referalToken.used = true
                    let transacton = new walletModel({
                        userId:user._id,
                        type:"credit",
                        amount:50,
                        reason:"Referal Bonous"
                    })
                    await user.save()
                    await referalToken.save()
                    await transacton.save()
    
                }
                
                if(!user){
                    let existUser = await userModel.findOne({email:profile.emails[0].value})
                    if(existUser){
                        return done(null, false, {
                            message: "User already exist"
                        });
                    }
                    user = await userModel.create({
                        googleId: profile.id,
                        username: profile.displayName,
                        email: profile.emails[0].value,
                        password: Math.random().toString(36).slice(-8),
                        mobileNo: 0 
                    })
                }
                req.session.user = {
                    id:user._id,
                    email:user.email,
                    isActive:user.isActive
                }
                
                return done(null,user)
            }catch(e){
                return done(e,null)
            }
        }
    ))
}

export default passportConfigure