import orderModel from "../model/orderModel.js"


export const adminOrdersUpdateLogic = async (orderId,reasonId)=>{
    try{

        const data = await orderModel.find({_id:orderId})

        if(!data){
            return {
                success:false,
                message: "Error while loading"
            }
        }

        let updateData = await orderModel.findOne({_id:orderId})
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