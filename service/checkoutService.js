import cartModel from "../model/cartModel.js"
import orderSchema from "../model/orderModel.js"
import variantModel from "../model/variantModel.js"
import { cartData } from "./cartService.js"

export const orderDetailsLoad = async (_id)=>{
    try{
        if(!_id){
            return {
                success:false,
                message:"Try again!!"
            }
        }
        const order = await orderSchema.findById({_id})
            .populate('shippingAddressId')
            .populate('orderItems.variantId');
        
        if(!order){
            return {
                success:false,
                message:"Try again!!"
            }
        }
        return {
            success:true,
            data:order
        }

    }catch(e){
        console.log("Error",e)
        return {
            success:false,
            message:"Server error"
        }

    }
}
export const OrderLogic = async (userDetails,method)=>{
    try{

        if(!userDetails||!method){
            return {
                success:false,
                message:"Try again!!"
            }
        }
        let cartItems = await cartData()
        const activeCartItems = cartItems.data.filter((item)=>item.variantId.status===true&&item.variantId.stock>0&&item.quantity<=item.variantId.stock);
        if(!cartItems.success){
            return {
                success:false,
                message:"Try again cart is empty"
            }
        }
        let orderItems = []
        let subTotal = 0
        for(let i of activeCartItems){

            const variant = i.variantId
            const totalPrice = variant.price * i.quantity;
            subTotal += totalPrice;
            orderItems.push({
                variantId: variant._id,
                productName: variant.productId.name,
                variantName: variant.color+variant.size,
                price: variant.price,
                quantity: i.quantity,
                totalPrice
            });

        }
        const taxAmount = subTotal * 0.05; 
        const totalAmount = subTotal + taxAmount;

        let newOrder = new orderSchema({

            userId:userDetails.id,
            shippingAddressId:userDetails.addressId,
            orderItems,
            subTotal,
            taxAmount,
            totalAmount,
            orderMethod:method,
            orderStatus: "placed",
            deliveryStatus: "pending"

        })

        await newOrder.save()
        await cartModel.deleteMany({ userId: userDetails.id });

        for(let i of orderItems){

            let variantUpdate = await variantModel.updateOne(
                {_id:i.variantId},
                {$inc:{stock:-i.quantity}}
            )
        }
        const Order_id = await orderSchema
        .findOne({ userId:userDetails.id })
        .sort({ createdAt: -1 });
        return {
            success:true,
            message:"Ordered successfully",
            id:Order_id._id
        }
    }catch(e){
        console.log("Error",e)
        return {
            success:false,
            message:"Server error"
        }
    }
}