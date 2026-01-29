import { adminOrdersUpdateLogic } from "../../service/adminOrderService.js"
import { getOrders } from "../../service/orderService.js"


export const adminOrdersLoad = async (req,res)=>{
    try{

        let order = await getOrders({})

        if(!order.success){

            return res.status(500).render('Admin/order-page',{
                activePage:'order',
                order:[]
            })
        }
        return res.status(200).render('Admin/order-page',{
            activePage:'order',
            order:order.data
        })
    }catch(e){
        console.log("Error ",e)
        return res.status(500).render('Admin/order-page',{
            activePage:'order',
            order:[]
        })
    }
}

export const adminOrdersDetailsLoad = async (req,res)=>{
    try{

        let orderId = req.params.id
        let order = await getOrders({_id:orderId})
        
        if(!order.success){

            return res.status(500).render('Admin/order-details',{
                activePage:'order',
                order:[]
            })
        }
        return res.status(200).render('Admin/order-details',{
            activePage:'order',
            order:order.data
        })

    }catch(e){
        console.log("Error ",e)
        return res.status(500).render('Admin/order-details',{
            activePage:'order',
            order:[]
        })
    }
}


export const adminOrdersUpdate = async  (req,res)=>{
    try{

        const {orderId, reasonId, purpose} = req.body
       
        const progress = await adminOrdersUpdateLogic(orderId,reasonId,purpose)

        if(!progress.success){
            return res.status(500).json({
                success:false,
                message:progress.message
            })
        }

        return res.status(200).json({
            success:true,
            message:progress.message
        })
    }catch(e){
        console.log(e)
        return res.status(500).json({
            success:false,
            message:e
        })
    }
}