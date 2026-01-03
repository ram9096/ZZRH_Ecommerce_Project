import { registerService, generateOtp, verifyOtpLogic, userLoginLogic, emailVerificationLogic, forgotPasswordLogic, findUserByEmail, ProductsLoad, ProductvariantDetails, variantFilterLogic } from "../service/userService.js";

//--------------Page renderings------------------

export const userLandingLoad = async(req, res) => {
    try{
        let products = await ProductsLoad({},5)
        if(req.session.user){
            return res.redirect('/home')
        }
        return res.render("User/landing-page",{product:products.data,error:''});
    }catch(er){
        console.log("Server error ",er)
        return res.status(500).render("User/landing-page",{product:[],error:"Server error"})
    }
};

export const userLoginload = (req, res) => {
    if(req.session.user){
        return res.redirect('/home')
    }
    return res.render("User/login-page",{error:req.flash("error")[0]});
};

export const userRegisterLoad = (req, res) => {
    if(req.session.user){
        return res.redirect('/home')
    }
    return res.render("User/register-page");
};

export const generateotpload = (req, res) => {
    if(req.session.user||!req.session.tempEmail){
        return res.redirect('/home')
    }
    return res.render("User/otp-verification", {
        email: req.session.tempEmail,
        error:'',
        success:''
    });
};
export const homePageLoad = async (req, res) => {
    try{
       
        let products = await ProductsLoad({},5)
        
        if(!req.session.user){
            return res.redirect('/login')
        }
        const email = req.session.user.email
        let user = await findUserByEmail(email)
        if(!user||!user.isActive){
            req.session.destroy()
            return res.redirect('/login')
        }
        return res.render("User/home",{
            product:products.data,
            color:products.color,
            size:products.size,
            error:''
        });
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
    if(req.session.user||req.session.otpContext != "FORGOT_PASSWORD"){
        return res.redirect('/home')
    }
    return res.render('User/forgot-password',{error:''})
}

export const productViewLoad = async(req,res)=>{
    try{
        let productId = req.params.id
        let color = req.query.color
        let size = req.query.size
        let products = await ProductvariantDetails(productId,color,size)
        if(!products.success){
            return res.render('User/product-view',{
                product:[],
                color:[],
                size:[],
                error:products.error,
                variant:[],
                error:products.message
            })
        }
        return res.render('User/product-view',{
            product:products.product,
            color:products.color,
            size:products.size,
            variant:products.variant,
            error:''
        })
    }catch(e){
        console.log("Error: ",e)
        return res.redirect('/')
    }
    
}
export const VariantFilter = async(req,res)=>{
    try{
        const {id,type,value}=req.body;
        const filter = { productId:id }
        filter[type] = value
        filter["status"] = true
        let variant = await variantFilterLogic(filter)
        if(!variant.success){
            return res.status(400).json({
                success:false,
                message:"Error while loading"
            })
        }
        res.status(200).json({
            success:true,
            product:variant.data,
            size: variant.data.size,
            color: variant.data.color
        })

    }catch(e){
        console.log("Error ",e)
        return res.status(500).json({
            success:false,
            message:"Server error"
        })
    }
}
export const productShowcaseLoad = async (req,res)=>{
    try{
        let products = await ProductsLoad({})
        return res.render('User/product-showcase',{product:products.data,color:[...products.color],size:products.size,category:products.category,error:''})
    }catch(e){

    }
}
// -----------------controllers-----------------

export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        let login = await userLoginLogic(email, password);
        
        if (!login.success&&login.message!="OTP NOT VERIFIED") {
            return res.status(401).json({
                success:false,
                message:login.message
            })
        }
        
        if(login.message == "OTP NOT VERIFIED"){
            req.session.tempEmail = login.data.email
            await generateOtp(login.data.email)
            return res.status(200).json({
                success:true,
                redirect:"/verify-otp"
            })
        }        
        req.session.user = {
            id: login.data._id,
            email: login.data.email,
            isActive:login.data.isActive
        };
        return res.status(200).json({
            success:true,
            redirect:"/home"
        })

    } catch (e) {
        return res.status(500).redirect("/");
    }
};

export const userRegister = async (req, res) => {
    try {
        const { name, email, password, mobileno } = req.body;

        let reg = await registerService(name, email, password, mobileno);

        if (!reg.success) {
            return res.status(400).render("User/login-page",{error:reg.message});
        }

        req.session.tempEmail = email; 

        await generateOtp(email);

        return res.status(201).redirect("/verify-otp");

    } catch (e) {
        console.log("Register Error:", e);
        return res.status(500).redirect("/login");
    }
};
export const resentOtp = async(req,res)=>{
    try{
        const email = req.session.tempEmail
        if (!email) {
            return res.status(401).render('User/otp-verification',{email,error:"SESSION EXPIRED TRY AGAIN",success:''});
        }
        const result = await generateOtp(email)
        if (!result.success) {
           return res.status(401).render('User/otp-verification',{email,error:result.message,success:''});
        }
        return res.status(200).render('User/otp-verification',{email,success:"OTP SUCCESSFULLY SENT AGAIN",error:''})
    }catch(e){
        console.log("Server error: ",e)
        return res.status(500).redirect('/login')
    }
}

export const verifyotp = async (req, res) => {
    try{
        const { otp } = req.body;

        let email = req.session.tempEmail;

        let verify = await verifyOtpLogic(email, otp);

        if (!verify.success) {
            console.log("OTP Error:", verify.message);
            return res.status(401).json({
                success:false,
                message:verify.message
            })
        }
        if(req.session.otpContext == "FORGOT_PASSWORD"){
            return res.status(200).json({
                success: true,
                redirect: "/forgot-password",
            });
        }
        req.session.tempEmail = null;
        req.session.user = {
            id: verify.data._id,
            email: verify.data.email
        };
        return res.status(200).json({
            success: true,
            redirect: "/home",
        });
    }catch(e){
        console.log("Error ",e)
        return res.status(500).json({
            success: false,
            message: "Server error. Please try again.",
        })
    }
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
    req.session.otpContext = ''
    return res.redirect('/login')

}

export const productLisitingLoad = async(req,res)=>{
    try{
        let filter = {},sortOption = {}
        if(req.query.color){
            filter.color = req.query.color
        }
        if(req.query.size){
            filter.size = req.query.size
        }
        if(req.query.price){
            sortOption.price = 1
        }
        let products = await ProductsLoad(filter)
        if(!products.success){
            return res.render("User/product-listing",{error:products.message,product:[]})
        }
        return res.render("User/product-listing",{
            product:products.data,
            error:'',
            color:products.color,
            size:products.size,
            colorValue:req.query.color||"",
            sizeValue:req.query.size||""
        })
    }catch(e){
        console.log("Server error ",e)
        return res.render("User/product-listing",{product:[],error:'Server error',color:'',size:''})
    }
}

export const productFilter = async(req,res)=>{
    try{
        const {category,minPrice,maxPrice,color,price,size} = req.body
        let filter  = {}
        if(category){
            filter["category.categoryName"] = category
        }
        if(category == 'all'){
            filter["category.categoryName"] = {}
        }
        if(category == 'all'){
           filter["category.categoryName"] = ''
        }
        if(color){
            filter.color = color
        }
        if(price){
            filter.price = price
        }
        if(size){
            filter.size = size
        }
        if(minPrice||maxPrice){
            filter.price = {}
            if(minPrice){
                filter.price.$gte = Number(minPrice)
            }
            if(maxPrice){
                filter.price.$lte = Number(maxPrice)
            }
        }
        let products = await ProductsLoad(filter)
        if(!products.success){
            return res.status(401).json({
                success:false,
                message:"Error while loading data"
            })
        }
        return res.status(200).json({
            success:true,
            product:products.data
        })
    }catch(e){
        console.log("Error from server ",e)
        return res.status(500).json({
            success:false,
            message:"Error from server"
        })
    }

}
