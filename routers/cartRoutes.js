import express from "express"
import { cartAdd, cartLoad, quantityUpdate, userCartDelete } from "../controller/cartController.js"
import { isAuthenticated } from "../middleware/userMiddleware.js"
let router = express.Router()

router.get('/',isAuthenticated,cartLoad)

router.post('/add-cart',cartAdd)
router.post('/delete-item',userCartDelete)
router.post('/update-quantity',quantityUpdate)

export default router