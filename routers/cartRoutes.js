import express from "express"
import { cartAdd, cartLoad, quantityUpdate, userCartDelete } from "../controller/cartController.js"
let router = express.Router()

router.get('/',cartLoad)

router.post('/add-cart',cartAdd)
router.post('/delete-item',userCartDelete)
router.post('/update-quantity',quantityUpdate)

export default router