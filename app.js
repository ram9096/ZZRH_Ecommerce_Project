import express from "express"
import userRouter from "./routers/userRoutes.js" 
import adminRouter from "./routers/adminRoutes.js"
import connect from "./config/db-config.js"
import session from "express-session"
import dotenv from "dotenv"
import passport from "passport"
import flash from 'connect-flash'
import rateLimit from "express-rate-limit"
import { pageNotFound } from "./controller/userController.js"
import passportConfigure from "./config/passport-config.js"
dotenv.config()


let app = express()
let port = process.env.PORT
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1000, 
    message: "Too many requests from this IP, please try again later."
});

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

app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

passportConfigure()

app.use('/',userRouter)
app.use('/admin',adminRouter)

app.get("/auth/google",passport.authenticate("google",{scope:["profile","email",]}))
app.get('/auth/google/callback',passport.authenticate("google",{
    failureRedirect:'/login',
    failureFlash:true,
    successRedirect: '/home'
}))

app.use(pageNotFound)

app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    console.error(err.stack);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

await connect()
app.listen(port,()=>{
    console.log("Server starting.....")
})
