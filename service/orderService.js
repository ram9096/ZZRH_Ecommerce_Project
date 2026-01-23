import orderModel from "../model/orderModel.js"
import variantModel from "../model/variantModel.js"

export const getOrders = async (filter)=>{
    try{
        let data  = await orderModel.find(filter)
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

        console.log(e)
        return {
            success:false,
            message:"Something went wrong"
        }

    }
}

export const cancelRequestLogic = async (id,reason,remark,orderid)=>{
    try{
        if(!id||!reason||!remark||!orderid){
            return {
                success:false,
                message:"Something went wrong"
            }
        }
        if(reason == ''|| remark == ''){
            return {
                success:false,
                message:"Fields cannot be empty"
            }
        }

        const requestProgress = await orderModel.findOne({_id:orderid})
        const item = requestProgress.orderItems.find(
            v => v.variantId.toString() === id.toString()
        );

        const quantity = item ? item.quantity : 0;
        if(!requestProgress){
            return {
                success:false,
                message:"Something went wrong"
            }
        }
        if (!requestProgress.cancelledAt) {
            requestProgress.cancelledAt = [];
        }
        
        requestProgress.cancelledProducts.push(id)
        
        requestProgress.cancelledAt.push({
            reason: reason,
            cancelledBy: "user",
            remarks: remark,
            requestedAt: new Date()
        });
        
        
        await requestProgress.save()
        await variantModel.updateOne({_id:id},{$inc:{stock:quantity}})
        return {
            success:true,
            message:"Cancel order requested"
        }

    }catch(e){
        console.log(e)
        return {
            success:false,
            message:"Something went wrong"
        }
    }
}