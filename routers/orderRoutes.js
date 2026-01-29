import express from "express"
import { cancellRequest, orderDetailsLoad, ordersLoad } from "../controller/orderController.js"
import { isAuthenticated } from "../middleware/userMiddleware.js"

let router = express.Router()

router.get('/',isAuthenticated,ordersLoad)
router.get('/details/:id',isAuthenticated,orderDetailsLoad)

router.post('/cancel-order',cancellRequest)
export default router