import express from "express"
import { cartAdd, cartLoad, userCartDelete } from "../controller/cartController.js"
let router = express.Router()

router.get('/',cartLoad)

router.post('/add-cart',cartAdd)
router.post('/delete-item',userCartDelete)
export default router