import { adminOrdersUpdateLogic } from "../../service/adminOrderService.js"
import { getOrders } from "../../service/orderService.js"


export const adminOrdersLoad = async (req,res)=>{
    try{

        let order = await getOrders({})

        if(!order.success){

            return res.render('Admin/order-page',{
                activePage:'order',
                order:[]
            })
        }
        return res.render('Admin/order-page',{
            activePage:'order',
            order:order.data
        })
    }catch(e){
        console.log("Error ",e)
    }
}

export const adminOrdersDetailsLoad = async (req,res)=>{
    try{

        let orderId = req.params.id
        let order = await getOrders({_id:orderId})
        
        if(!order.success){

            return res.render('Admin/order-details',{
                activePage:'order',
                order:[]
            })
        }
        return res.render('Admin/order-details',{
            activePage:'order',
            order:order.data
        })
    }catch(e){
        console.log("Error ",e)
    }
}


export const adminOrdersUpdate = async  (req,res)=>{
    try{

        const {orderId, reasonId} = req.body

        const progress = await adminOrdersUpdateLogic(orderId,reasonId)

        if(!progress.success){
            return res.status(401).json({
                success:false,
                message:progress.message
            })
        }

        return res.json({
            success:true,
            message:progress.message
        })
    }catch(e){
        console.log(e)
        return res.json({
            success:false,
            message:e
        })
    }
}