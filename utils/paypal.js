import paypalClient from "../config/paypal-config.js";
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";
import { calculateOrderTotal } from "./totalCalculate.js";
import paymentSchema from "../model/paymentModel.js";

export const createOrder = async (req, res) => {
    try{
      
      const total = await calculateOrderTotal(req.session.user.id ? req.session.user.id:req.session.user._id)
      if (!total.success) {
          return res.status(400).json({ message: "Cart empty" })
      }
      const usdAmount = Math.round((total.totalAmount / 90.72) * 100) / 100;
      
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

    }catch(e){
      console.error("Create order  Error:", error);
      res.status(500).json({ message: "Payment failed" });
    }
};

export const captureOrder = async (req, res) => {
  try {
    const { orderID } = req.body;

    const request =
      new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);

    request.requestBody({});

    const capture = await paypalClient.execute(request);

    const result = capture.result;

    const status = result.status;

    if (status === "COMPLETED") {

      const paymentDetails =
        result.purchase_units[0].payments.captures[0];
     
      
      let userId = req.session.user.id
      let email = req.session.user.email
      
      const newOrder = new paymentSchema({
        userId, 
        paypalOrderId: orderID,
        paypalCaptureId: paymentDetails.id,
        amount: paymentDetails.amount.value,
        currency: paymentDetails.amount.currency_code,
        paymentStatus: status,
        payerEmail: email,
        payerName: result.payer.name.given_name
      });

      await newOrder.save();

      return res.json({
        success: true,
        status:"COMPLETED"
      });
    }

    res.json({
      success: false
    });

  } catch (error) {
    console.error("Capture Error:", error);
    res.status(500).json({ message: "Payment failed" });
  }
}
