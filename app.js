import express from "express"
import userRouter from "./routers/userRoutes.js" 
import adminRouter from "./routers/adminRoutes.js"
import connect from "./config/db-config.js"
import session from "express-session"
import dotenv from "dotenv"
import nocache from "nocache"
import passport from "passport"
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import userModel from "./model/userModel.js"
import flash from 'connect-flash'
import referalModel from "./model/referalModel.js"
import walletModel from "./model/walletModel.js"
import rateLimit from "express-rate-limit"
dotenv.config()


let app = express()
let port = process.env.PORT
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1000, 
    message: "Too many requests from this IP, please try again later."
});
// middlewares
app.use(limiter);
app.use(express.static('public'))
app.use(express.static("uploads"))

app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.set('view engine','ejs')
app.set("trust proxy", 1);
app.use((req, res, next) => {
    res.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, private"
    );
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    next();
});

//Session set-up

app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false,
    cookie: {
        httpOnly: true,
        secure: false,       
        sameSite: "lax",      
        maxAge: 1000 * 60 * 60 * 24 
    }
}))

//Google authentication

app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

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

//routes

app.use('/',userRouter)
app.use('/admin',adminRouter)

app.get("/auth/google",passport.authenticate("google",{scope:["profile","email",]}))
app.get('/auth/google/callback',passport.authenticate("google",{
    failureRedirect:'/login',
    failureFlash:true,
    successRedirect: '/home'
}))


//error handling middleware

app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    console.error(err.stack);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

// prot setup
app.listen(port,()=>{
    console.log("Server starting.....")
})
