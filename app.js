import express from "express"
import userRouter from "./routers/userRoutes.js" 
import adminRouter from "./routers/adminRoutes.js"
import connect from "./config/db-config.js"
import session from "express-session"
import dotenv from "dotenv"
import nocache from "nocache"
import passport from "passport"
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
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
    secret:"#ZZRH",
    resave:false,
    saveUninitialized:false
}))

//Google authentication

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user,done)=>{
    done(null,user)
})

passport.deserializeUser((user,done)=>{
    done(null,user)
})

passport.use(new GoogleStrategy({ 
    clientID:process.env.CLIENT_ID,
    clientSecret:process.env.CLIENT_SECRET,
    callbackURL:"/auth/google/callback"
},
(accessToken,refreshToken,profile,done)=>{
    return done(null,profile)
}
))

//routes

app.use('/',userRouter)
app.use('/admin',adminRouter)

app.get("/auth/google",passport.authenticate("google",{scope:["profile","email",]}))
app.get('/auth/google/callback',passport.authenticate("google",{failureRedirect:'/login'}))


// port setup

app.listen(port,()=>{
    console.log("Server starting.....")
})

//error handling middleware

app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    console.error(err.stack);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});