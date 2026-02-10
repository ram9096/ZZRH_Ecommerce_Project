import { productModelLoad, variantLoad } from "../../service/adminService.js";
import { getOrders } from "../../service/orderService.js";

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


export const reportGenerator = (req,res)=>{
    try {
        const { period, status, payment, from, to } = req.body
        
        
        return res.json({
            success:true,
            message:"yes"
        })
    } catch (e) {
        
    }
}