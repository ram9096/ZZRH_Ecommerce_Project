import express from "express"
import { adminCategoryAdd, adminCategoryAddLoad, adminCategoryEdit, adminCategoryEditLoad, adminCategoryLoad } from "../controller/categoryController.js"
import { adminProductEdit, adminProductEditLoad, adminProductsAdd, adminProductsAddLoad, adminProductsLoad } from "../controller/productController.js"
import { adminHomeLoad, adminLogin, adminLoginLoad, adminLogout, adminUserEdit, adminUsersLoad } from "../controller/adminController.js"
import { isAdminAuthenticated } from "../middleware/adminMiddleware.js"
import {upload} from "../config/multerConfig.js"
import { adminOrdersDetailsLoad, adminOrdersLoad, adminOrdersUpdate } from "../controller/Admin/orderController.js"
let router = express.Router()

router.get('/',adminLoginLoad)
router.get('/home',isAdminAuthenticated,adminHomeLoad)
router.get('/users',isAdminAuthenticated,adminUsersLoad)

router.get('/category',isAdminAuthenticated,adminCategoryLoad)
router.get('/category-add',isAdminAuthenticated,adminCategoryAddLoad)
router.get('/category-edit/:id',isAdminAuthenticated,adminCategoryEditLoad)

router.get('/products',isAdminAuthenticated,adminProductsLoad)
router.get('/product-add',isAdminAuthenticated,adminProductsAddLoad)
router.get('/products/:id',adminProductEditLoad)
router.get('/logout',adminLogout)

router.post('/login',adminLogin)
router.post('/users/edit',adminUserEdit)

router.get('/orders',isAdminAuthenticated,adminOrdersLoad)
router.get('/orders/details/:id',isAdminAuthenticated,adminOrdersDetailsLoad)

router.post('/orders/update',adminOrdersUpdate)

router.post('/category-add',upload.none(),adminCategoryAdd)
router.post('/category-edit/:id',upload.none(),isAdminAuthenticated,adminCategoryEdit)

router.post('/product-add',upload.any(),adminProductsAdd)
router.post('/products/:id',upload.any(),adminProductEdit)


export default router

