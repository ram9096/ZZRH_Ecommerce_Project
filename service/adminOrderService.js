import orderModel from "../model/orderModel.js"
import userModel from "../model/userModel.js"


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

            user.wallet += updateData.totalAmount

            updateData.returnedAt[0].returnRequestStatus = "Approved"
            
            await updateData.save()
            await user.save()

            return {
                success:true,
                message:"Amount refunded successfully"
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