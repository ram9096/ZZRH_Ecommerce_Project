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
        if (!requestProgress.cancelledAt) {
            requestProgress.cancelledAt = [];
        }

        if(id=="ALL"){
            requestProgress.expectedDeliveryDate=null
            for(let i of requestProgress.orderItems){

                if(requestProgress.cancelledProducts.includes(i.variantId)){
                    continue
                }

                requestProgress.cancelledProducts.push(i.variantId)
                await variantModel.updateOne({_id:i.variantId},{$inc:{stock:i.quantity}})
            }

            requestProgress.cancelledAt.push({
                reason: reason,
                cancelledBy: "user",
                remarks: remark,
                requestedAt: new Date()
            });

           

            await requestProgress.save()
            
            return {
                success:true,
                message:"Cancel order requested"
            }

        }
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
        

         if (requestProgress.cancelledProducts.includes(id)) {
            return {
                success: false,
                message: "Product already requested for cancellation"
            };
        }

        requestProgress.cancelledProducts.push(id)
        
        requestProgress.cancelledAt.push({
            reason: reason,
            cancelledBy: "user",
            remarks: remark,
            requestedAt: new Date()
        });
        
        if(requestProgress.cancelledProducts.length == requestProgress.orderItems.length){
            requestProgress.expectedDeliveryDate=null
        }
        
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