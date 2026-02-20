import { salesReportLogic } from "../../service/admin/salesReportService.js";
import { productModelLoad, variantLoad } from "../../service/adminService.js";
import { getOrders } from "../../service/orderService.js";

export const analyticsLoad = async (req,res)=>{
    try{

        const { period, status, payment, from, to } = req.query;

        
        if(!period){

            let order = await getOrders({})
            let variant = await variantLoad()
            let productModel = await productModelLoad({})
            let totalOrders = 0;
            let fullRevenue =0;
            let fullDiscount  =0 

            order.data.forEach(order => {
                order.orderItems.forEach(item => {
                    if(order.orderStatus.toUpperCase()=="COMPLETED"){
                        fullRevenue += item.totalPrice;
                        totalOrders += item.quantity;
                        if(item.basePrice!=null){
                            fullDiscount += (item.basePrice-item.price)*item.quantity
                        }
                    }
                });
            });
    
            if(!order.success){
                return res.render('Admin/analytics-page',{
                    activePage:'analytics',
                    order:[],
                    variant:[],
                    product:[],
                    fullRevenue:0,
                    totalOrders:0,
                    fullDiscount:0,
                    period:period||"today",
                    status:status||"all",
                    payment:payment||"all"
                })    
            }
            return res.render('Admin/analytics-page',{
                activePage:'analytics',
                order:order.data,
                variant:variant.data,
                product:productModel.data,
                fullRevenue,
                totalOrders,
                fullDiscount,
                period:period||"today",
                status:status||"all",
                payment:payment||"all"
            })
        }

        const ReportData  = await salesReportLogic(period, status, payment, from, to)
        
        let variant = await variantLoad()
        let productModel = await productModelLoad({})
        let totalOrders = 0;
        let fullRevenue =0;
        let fullDiscount  =0 
        
        ReportData.data.forEach(order => {
            order.orderItems.forEach(item => {
                if(order.orderStatus.toUpperCase()=="COMPLETED"){
                    fullRevenue += item.totalPrice;
                    totalOrders += item.quantity;
                    if(item.basePrice!=null){
                        fullDiscount += (item.basePrice-item.price)*item.quantity
                    }
                }
            });
        });
        
        if(!ReportData.success){
            return res.render('Admin/analytics-page',{
                activePage:'analytics',
                order:[],
                variant:[],
                product:[],
                fullRevenue:0,
                totalOrders:0,
                fullDiscount:0,
                period:period||"today",
                status:status||"all",
                payment:payment||"all"
            })    
        }
        return res.render('Admin/analytics-page',{
            activePage:'analytics',
            order:ReportData.data,
            variant:variant.data,
            product:productModel.data,
            fullRevenue,
            totalOrders,
            fullDiscount,
            period:period||"today",
            status:status||"all",
            payment:payment||"all"
        })

    }catch(e){

        console.log(e)
        return res.render('Admin/analytics-page',{
            activePage:'analytics',
            order:[],
            variant:[],
            product:[],
            fullRevenue:0,
            totalOrders:0,
            fullDiscount:0
        }) 
    }

}


export const reportGenerator = async (req,res)=>{
    try {
        const { period, status, payment, from, to } = req.body

        const data = await salesReportLogic(period, status, payment, from, to)
        
        return res.json({
            success:true,
            data:data.data
        })  
    } catch (e) {
        
    }
}