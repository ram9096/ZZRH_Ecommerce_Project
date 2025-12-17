import { registerService, generateOtp, verifyOtpLogic, userLoginLogic, emailVerificationLogic, forgotPasswordLogic, findUserByEmail } from "../service/userService.js";

//--------------Page renderings------------------

export const userLandingLoad = (req, res) => {
    if(req.session.user){
        return res.redirect('/home')
    }
    return res.render("User/landing-page");
};

export const userLoginload = (req, res) => {
    if(req.session.user){
        return res.redirect('/home')
    }
    return res.render("User/login-page",{error:''});
};

export const userRegisterLoad = (req, res) => {
    if(req.session.user){
        return res.redirect('/home')
    }
    return res.render("User/register-page");
};

export const generateotpload = (req, res) => {
    if(req.session.user){
        return res.redirect('/home')
    }
    return res.render("User/otp-verification", {
        email: req.session.tempEmail
    });
};
export const homePageLoad = async (req, res) => {

    try{
        if(!req.session.user){
            return res.redirect('/login')
        }
        const email = req.session.user.email
        let user = await findUserByEmail(email)
        if(!user||!user.isActive){
            req.session.destroy()
            return res.redirect('/login')
        }
        return res.render("User/home");
    }catch(e){
        console.log("Home page load Error: ",e)
        return res.status(500).redirect('/login')
    }
};
export const emailVerificationLoad = (req,res)=>{
    if(req.session.user){
        return res.redirect('/home')
    }
    return res.render('User/email-verification',{error:''})
}
export const forgotPasswordLoad = (req,res)=>{
    if(req.session.user){
        return res.redirect('/home')
    }
    return res.render('User/forgot-password',{error:''})
}

// -----------------controllers-----------------

export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        let login = await userLoginLogic(email, password);
        
        if (!login.success&&login.message!="OTP NOT VERIFIED") {
            return res.render("User/login-page",{error:login.message});
        }
        
        if(login.message == "OTP NOT VERIFIED"){
            req.session.tempEmail = login.data.email
            await generateOtp(login.data.email)
            return res.redirect('/verify-otp')
        }        
        req.session.user = {
            id: login.data._id,
            email: login.data.email,
            isActive:login.data.isActive
        };
        return res.redirect("/home");

    } catch (e) {
        return res.status(500).redirect("/");
    }
};

export const userRegister = async (req, res) => {
    try {
        const { name, email, password, mobileno } = req.body;

        let reg = await registerService(name, email, password, mobileno);

        if (!reg.success) {
            return res.status(400).redirect("/login");
        }

        req.session.tempEmail = email; 

        await generateOtp(email);

        return res.status(201).redirect("/verify-otp");

    } catch (e) {
        console.log("Register Error:", e);
        return res.status(500).redirect("/login");
    }
};


export const verifyotp = async (req, res) => {
    const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;

    let otp = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;

    let email = req.session.tempEmail;

    let verify = await verifyOtpLogic(email, otp);

    if (!verify.success) {
        console.log("OTP Error:", verify.message);
        return res.status(401).redirect("/verify-otp");
    }
    if(req.session.otpContext == "FORGOT_PASSWORD"){
        return res.redirect('/forgot-password')
    }
    req.session.tempEmail = null;
    req.session.user = {
        id: verify.data._id,
        email: verify.data.email
    };
    return res.status(200).redirect("/home");
};

export const emailVerification = async (req,res)=>{
    const {email} = req.body;
    let tempUserProgress = await emailVerificationLogic(email)
    if(!tempUserProgress.success){
        return res.render('User/email-verification',{error:tempUserProgress.message})
    }
    req.session.otpContext = "FORGOT_PASSWORD"
    req.session.tempEmail = tempUserProgress.data.email
    await generateOtp(tempUserProgress.data.email)
    return res.redirect('/verify-otp')
    
}
export const userLogout = (req,res)=>{
    req.session.destroy(err => {
        if (err) {
        
        res.clearCookie('connect.sid');
        return res.redirect('/home');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login'); 
    });
}

export const forgotPassword = async (req,res)=>{
    const {password} = req.body
    const email = req.session.tempEmail
    let tempUserProgress = await forgotPasswordLogic(email,password)
    if(!tempUserProgress.success){
        return res.render("User/forgot-password",{error:tempUserProgress.message})
    }
    return res.redirect('/login')

}
