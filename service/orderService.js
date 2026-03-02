import orderModel from "../model/orderModel.js"
import userModel from "../model/userModel.js";
import variantModel from "../model/variantModel.js"
import walletModel from "../model/walletModel.js";

export const getOrders = async (filter,page=1,limit=0)=>{
    try{

        const totalOrders = await orderModel.countDocuments(filter);

        const skip = (page-1)*limit
        let data  = await orderModel
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
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
            data:data,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalOrders / limit),
                totalOrders
            }
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
            let products = []
            for(let i of requestProgress.orderItems){
                products.push(i.variantId)
                
                await variantModel.updateOne({_id:i.variantId},{$inc:{stock:i.quantity}})
            }
            
            requestProgress.orderStatus = "cancelled"
            requestProgress.deliveryStatus = "cancelled"
            requestProgress.cancelledAt.push({
                reason: reason,
                cancelledBy: "user",
                remarks: remark,
                requestedAt: new Date(),
                cancelledProducts:products
            });
            if(requestProgress.orderMethod == "WALLET"||requestProgress.orderMethod == "PAYPAL"){
                let wallet = await userModel.findOne({_id:requestProgress.userId})
                wallet.wallet+=requestProgress.totalAmount
                let transaction = new walletModel({
                    userId:requestProgress.userId,
                    type:"credit",
                    amount:requestProgress.totalAmount,
                    reason:"Order Refund"
                })

                transaction.save()
                wallet.save()
            }   
            await requestProgress.save()
            
            return {
                success:true,
                message:"Order got cancelled"
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
        if(requestProgress.orderMethod == "WALLET"||requestProgress.orderMethod == "PAYPAL"){
            let wallet = await userModel.findOne({_id:requestProgress.userId})
            wallet.wallet+=Canceledprice
            let transaction = new walletModel({
                userId:requestProgress.userId,
                type:"credit",
                amount:Canceledprice,
                reason:"Order Refund"
            })

            transaction.save()
            wallet.save()
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


export const returnRequestLogic = async (orderId,reason,remark,resolution,variantId)=>{
    try{

        let order = await orderModel.findOne({_id:orderId})

        if(!order){
            return {
                success:false,
                message:"Order Id error try again!"
            }
        }

        if(order.returnedAt == null){
            order.returnedAt = []
        }
        order.returnedAt.push({
            reason:reason,
            remark:remark,
            resolution:resolution,
            variant:variantId
        })
        
        await order.save()
        return {
            success:true,
            message:"Return request submitted successfully"
        }

    }catch(e){

        console.log(e)
        return {
            success:false,
            message:"server error"
        }
    }
}