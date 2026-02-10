import paypalClient from "../config/paypal-config.js";
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";
import { calculateOrderTotal } from "./totalCalculate.js";

export const createOrder = async (req, res) => {
    const total = await calculateOrderTotal()
    if (!total.success) {
        return res.status(400).json({ message: "Cart empty" })
    }
    const usdAmount = Number((total.totalAmount / 90.72).toFixed(2));

    if (!usdAmount || usdAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
    }
    req.session.paypalTotal = usdAmount
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();

    request.prefer("return=representation");
    request.requestBody({
        intent: "CAPTURE",
        purchase_units: [{
        amount: {
            currency_code: "USD",
            value: usdAmount.toString()
        }
        }]
    });

    const order = await paypalClient.execute(request);
    
    res.json({ id: order.result.id });
};

export const captureOrder = async (req, res) => {
  const { orderID } = req.body

  const request =
    new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID)
  request.requestBody({})

  const capture = await paypalClient.execute(request)
  const status = capture.result.status   
    console.log("Reached here status",status)
  res.json({
    success: status === "COMPLETED",
    status
  })
}
