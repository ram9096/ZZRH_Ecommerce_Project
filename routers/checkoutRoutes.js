import express from "express"
import { checkoutLoad } from "../controller/checkoutController.js"
let router = express.Router()

router.get('/',checkoutLoad)

export default router