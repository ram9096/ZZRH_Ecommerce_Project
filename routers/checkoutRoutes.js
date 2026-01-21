import express from "express"
import { checkoutFetcher, checkoutLoad, orderController, orderSuccessLoad, paymentMethodLoad } from "../controller/checkoutController.js"
import { isAuthenticated } from "../middleware/userMiddleware.js"
import { downloadInvoice } from "../utils/invoice.js"
let router = express.Router()

router.get('/',isAuthenticated,checkoutLoad)
router.get('/method',isAuthenticated,paymentMethodLoad)
router.get('/order-confirmed',orderSuccessLoad)
router.get("/invoice/:id", downloadInvoice);

router.post('/',checkoutFetcher)
router.post('/method',orderController)

export default router