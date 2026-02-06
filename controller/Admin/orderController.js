import { adminOrdersUpdateLogic } from "../../service/adminOrderService.js"
import { productModelLoad, variantLoad } from "../../service/adminService.js"
import { getOrders } from "../../service/orderService.js"


export const adminOrdersLoad = async (req,res)=>{
    try{
        let filter = {}
        const page = req.query.page || 1
        let search = req.query.search || ''
        if(search){
            filter.orderItems = {
                    $elemMatch: {
                        productName: { $regex: search, $options: 'i' }
                    }
            }
        }
        let order = await getOrders(filter,page,3)

        if(!order.success){

            return res.status(500).render('Admin/order-page',{
                activePage:'order',
                order:[],
                pagination:order.pagination,
                search:search
            })
        }
        return res.status(200).render('Admin/order-page',{
            activePage:'order',
            order:order.data,
            pagination:order.pagination,
            search:search
        })
    }catch(e){
        console.log("Error ",e)
        return res.status(500).render('Admin/order-page',{
            activePage:'order',
            order:[],
            pagination:order.pagination,
            search:search
        })
    }
}

export const analyticsLoad = async (req,res)=>{
    try{

        let order = await getOrders({})
        let variant = await variantLoad()
        let productModel = await productModelLoad({})
        let totalOrders = 0;
        let fullRevenue = 0;

        order.data.forEach(order => {
            order.orderItems.forEach(item => {
                fullRevenue += item.totalPrice;
            });
        });

        order.data.forEach(order => {
            order.orderItems.forEach(item => {
                totalOrders += item.quantity;
            });
        });

        if(!order.success){
            return res.render('Admin/analytics-page',{
                activePage:'analytics',
                order:[],
                variant:[],
                product:[],
                fullRevenue:0,
                totalOrders:0
            })    
        }
        return res.render('Admin/analytics-page',{
            activePage:'analytics',
            order:order.data,
            variant:variant.data,
            product:productModel.data,
            fullRevenue,
            totalOrders
        })

    }catch(e){

        console.log(e)
        return res.render('Admin/analytics-page',{
            activePage:'analytics',
            order:[],
            variant:[],
            product:[],
            fullRevenue:0,
            totalOrders:0
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