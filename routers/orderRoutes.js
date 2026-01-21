import express from "express"
import { ordersLoad } from "../controller/orderController.js"

let router = express.Router()

router.get('/',ordersLoad)

export default router