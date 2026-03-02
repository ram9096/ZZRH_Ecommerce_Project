import express from "express"
import { cancellRequest, orderDetailsLoad, ordersLoad, returnRequest } from "../controller/orderController.js"
import { isAuthenticated } from "../middleware/userMiddleware.js"

let router = express.Router()

router.get('/',isAuthenticated,ordersLoad)
router.get('/details/:id',isAuthenticated,orderDetailsLoad)

router.post('/cancel-order',cancellRequest)
router.post('/return-request',returnRequest)
export default router