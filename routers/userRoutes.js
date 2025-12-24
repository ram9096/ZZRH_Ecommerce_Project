import express from "express"
import { userLoginload,userRegister,verifyotp,generateotpload,homePageLoad,userLandingLoad, userRegisterLoad, userLogin, emailVerificationLoad, userLogout, forgotPasswordLoad, emailVerification, forgotPassword, productViewLoad, resentOtp, productLisitingLoad } from "../controller/userController.js"
import { isAuthenticated } from "../middleware/userMiddleware.js"
let router = express.Router()

router.get('/',userLandingLoad)
router.get('/login',userLoginload)
router.get('/register',userRegisterLoad)
router.get('/home',isAuthenticated,homePageLoad)
router.get('/verify-otp',generateotpload)
router.get('/email-verification',emailVerificationLoad)
router.get('/forgot-password',forgotPasswordLoad)
router.get('/logout',userLogout)
router.get('/home/product-details/:id',productViewLoad)
router.get('/product-listing',productLisitingLoad)

router.post('/login',userLogin)
router.post('/register',userRegister)
router.post('/verify-otp',verifyotp)
router.post('/email-verification',emailVerification)
router.post('/forgot-password',forgotPassword)
router.post('/resent-otp',resentOtp)
export default router;