import orderModel from "../model/orderModel.js"
import userModel from "../model/userModel.js"
import variantModel from "../model/variantModel.js"
import walletModel from "../model/walletModel.js"


export const adminOrdersUpdateLogic = async (orderId,reasonId,purpose = null)=>{
    try{

        const updateData = await orderModel.findOne({_id:orderId})

        if(!updateData){
            return {
                success:false,
                message: "Error while loading"
            }
        }

        if(purpose == "DELIVERY_UPDATE"){

            updateData.deliveryStatus = reasonId
            await updateData.save()
            return {
                success:true,
                message:"Delivery status updated"
            }
        }

        if(purpose == "ORDER_UPDATE"){

            updateData.orderStatus = reasonId
            await updateData.save()
            return {
                success:true,
                message:"Delivery status updated"
            }
        }
        if(purpose == "REFUND_REQUEST"){

            const user = await userModel.findOne({_id:updateData.userId})
            if(updateData.returnedAt[0].variant == "ALL"){

                user.wallet += updateData.totalAmount
                let transaction = new walletModel({
                    userId:updateData.userId,
                    type:"credit",
                    amount:updateData.totalAmount,
                    reason:"Order Refund"
                })
                await transaction.save()
                for(let item of updateData.orderItems){
                    await variantModel.updateOne({_id:item.variantId},{$inc:{stock:item.quantity}})
                }
            }else{
                for(let item of updateData.orderItems){
                    if(item.variantId == updateData.returnedAt[0].variant){
                        user.wallet +=item.totalPrice
                        await variantModel.updateOne({_id:item.variantId},{$inc:{stock:item.quantity}})
                        let transaction = new walletModel({
                            userId:updateData.userId,
                            type:"credit",
                            amount:item.totalPrice,
                            reason:"Order Refund"
                        })
                        await transaction.save()
                    }
                }
            }

            updateData.returnedAt[0].returnRequestStatus = "Approved"
            
            await updateData.save()
            await user.save()

            return {
                success:true,
                message:"Amount refunded successfully"
            }
        }

        if(purpose == "OTHER_REQUEST"){
            
            updateData.returnedAt[0].returnRequestStatus = "Approved"
            
            await updateData.save()
            

            return {
                success:true,
                message:"Request approved"
            }
        }

        if(purpose == "REJECT_REQUEST"){

            updateData.returnedAt[0].returnRequestStatus = "Rejected"

            await updateData.save()

            return {

                success:true,
                message:"Request rejected"
            }

        }
       
        const index = updateData.cancelledAt.findIndex(
            o => o._id.toString() === reasonId.toString()
        );

        if (index === -1) {
            throw new Error("Cancel request not found");
        }
        updateData.cancelledAt[index].cancelRequestStatus = "approved"
        
        await updateData.save()

        return {
            success:true,
            message:"Cancel request approved"
        }

    }catch(e){
        console.log(e)
        return {
            success:false,
            message:"Server error"
        }
    }
}