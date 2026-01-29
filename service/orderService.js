import orderModel from "../model/orderModel.js"
import variantModel from "../model/variantModel.js"

export const getOrders = async (filter)=>{
    try{
        let data  = await orderModel.find(filter)
            .populate('userId')
            .populate('shippingAddressId')
            .populate('orderItems.variantId')
            .populate({
                path: 'cancelledAt.cancelledProducts',
                populate: {
                path: 'productId',
                model: 'Product'
                }
            });

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
        const Canceledprice = item.price*quantity

        if(!requestProgress){
            return {
                success:false,
                message:"Something went wrong"
            }
        }

        requestProgress.cancelledAt.push({
            reason: reason,
            cancelledBy: "user",
            remarks: remark,
            requestedAt: new Date(),
            cancelledProducts:[id]
        });
        
        const cancelledSet = new Set();

        requestProgress.cancelledAt?.forEach(cancel => {
            cancel.cancelledProducts.forEach(id => {
                cancelledSet.add(id.toString());
            });
        });

        if (cancelledSet.size === requestProgress.orderItems.length) {
            requestProgress.expectedDeliveryDate = null;
        }
        requestProgress.subTotal -= Canceledprice
        requestProgress.taxAmount = requestProgress.subTotal*0.05
        requestProgress.totalAmount = requestProgress.subTotal+requestProgress.taxAmount

        if(requestProgress.orderItems.length==requestProgress.cancelledAt.length){
            requestProgress.orderStatus = "cancelled"
            requestProgress.deliveryStatus = "cancelled"
        }
        
        await requestProgress.save()

        await variantModel.updateOne({_id:id},{$inc:{stock:quantity}})
        return {
            success:true,
            message:"Item got cancelled"
        }

    }catch(e){
        console.log(e)
        return {
            success:false,
            message:"Something went wrong"
        }
    }
}