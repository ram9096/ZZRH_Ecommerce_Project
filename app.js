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
dotenv.config()


let app = express()
let port = process.env.PORT

// middlewares

app.use(express.static('public'))
app.use(express.static("uploads"))

app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.set('view engine','ejs')
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
        callbackURL:"/auth/google/callback"
    },
    async (accessToken,refreshToken,profile,done)=>{
        try{
            let user = await userModel.findOne({googleId:profile.id})
            if(user && !user.isActive){
                return done(null, false, {
                    message: "User access is denied"
                });
            }
            if(!user){
                user = await userModel.create({
                    googleId: profile.id,
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    password: Math.random().toString(36).slice(-8),
                    mobileNo: 0 
                })
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
