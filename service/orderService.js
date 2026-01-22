import orderModel from "../model/orderModel.js"

export const getOrders = async (_id)=>{
    try{
        let data  = await orderModel.find({userId:_id})
            .populate('shippingAddressId')
            .populate('orderItems.variantId')
        if(!data){
            return {
                success:false,
                message:"Error while loading"
            }
        }

        return {
            success:true,
            data:data
        }

    }catch(e){

    }
}