import orderModel from "../model/orderModel.js"


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