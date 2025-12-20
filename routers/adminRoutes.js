import express from "express"
import {  adminCategoryAdd, adminCategoryAddLoad, adminCategoryEdit, adminCategoryEditLoad, adminCategoryLoad, adminHomeLoad, adminLogin, adminLoginLoad, adminProductsAdd, adminProductsAddLoad, adminProductsLoad, adminUserEdit, adminUsersLoad } from "../controller/adminController.js"
import { isAdminAuthenticated } from "../middleware/adminMiddleware.js"
import {upload} from "../config/multerConfig.js"
let router = express.Router()

router.get('/',adminLoginLoad)
router.get('/home',isAdminAuthenticated,adminHomeLoad)
router.get('/users',isAdminAuthenticated,adminUsersLoad)
router.get('/category',isAdminAuthenticated,adminCategoryLoad)
router.get('/category-add',isAdminAuthenticated,adminCategoryAddLoad)
router.get('/category-edit/:id',isAdminAuthenticated,adminCategoryEditLoad)
router.get('/products',adminProductsLoad)
router.get('/product-add',adminProductsAddLoad)


router.post('/login',adminLogin)
router.post('/category-add',adminCategoryAdd)
router.post('/category-edit/:id',isAdminAuthenticated,adminCategoryEdit)
router.post('/product-add',upload.any(),adminProductsAdd)
router.post('/users/edit',adminUserEdit)
export default router

