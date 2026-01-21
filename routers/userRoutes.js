import express from "express"
import { userLoginload,userRegister,verifyotp,generateotpload,homePageLoad,userLandingLoad, userRegisterLoad, userLogin, emailVerificationLoad, userLogout, forgotPasswordLoad, emailVerification, forgotPassword, productViewLoad, resentOtp, productLisitingLoad, productShowcaseLoad, productFilter, VariantFilter } from "../controller/userController.js"
import { isAuthenticated } from "../middleware/userMiddleware.js"
import { userAddressAdd, userAddressDelete, userAddressLoad, userEmailEdit, userEmailEditLoad, userNameEdit, userNameEditLoad, userPasswordEdit, userPasswordEditLoad, userProfileLoad } from "../controller/userProfileController.js"
import { cartLoad } from "../controller/cartController.js"
import CartRoutes from "./cartRoutes.js"
import checkOutRoutes from "./checkoutRoutes.js"
import OrderRoutes from "./orderRoutes.js"
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
router.get('/products',productShowcaseLoad)
router.get('/profile',isAuthenticated,userProfileLoad)
router.get('/profile/change-username',isAuthenticated,userNameEditLoad)
router.get('/profile/change-email',isAuthenticated,userEmailEditLoad)
router.get('/profile/change-password',isAuthenticated,userPasswordEditLoad)
router.get('/profile/address-management',isAuthenticated,userAddressLoad)
router.use('/cart',CartRoutes)
router.use('/checkout',checkOutRoutes)
router.use('/order',OrderRoutes)

router.post('/login',userLogin)
router.post('/register',userRegister)
router.post('/verify-otp',verifyotp)
router.post('/email-verification',emailVerification)
router.post('/forgot-password',forgotPassword)
router.post('/resent-otp',resentOtp)
router.post('/products/filter',productFilter)
router.post('/home/product-details/:id',VariantFilter)
router.post('/profile/change-username',userNameEdit)
router.post('/profile/change-email',userEmailEdit)
router.post('/profile/change-password',userPasswordEdit)
router.post('/profile/address-management',userAddressAdd)
router.post('/profile/delete-address/:id',userAddressDelete)

export default router;