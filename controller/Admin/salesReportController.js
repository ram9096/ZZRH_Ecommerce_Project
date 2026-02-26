import { couponFetcher } from "../../service/admin/couponService.js";
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
            let coupon = await couponFetcher({})
            let totalOrders = 0;
            let fullRevenue =0;
            let fullDiscount  =0 

            order.data.forEach(order => {
                order.orderItems.forEach(item => {
                    if(order.orderStatus.toUpperCase()=="COMPLETED"){
                        if(!order.returnedAt){

                            fullRevenue += item.totalPrice;
                            totalOrders += item.quantity;
                            if(item.variantId.basePrice!=null){
                                fullDiscount += (item.variantId.basePrice-item.variantId.price)*item.quantity
                            }
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
                    period:period||"all",
                    status:status||"all",
                    payment:payment||"all",
                    coupon:[],
                    start:from,
                    end:to,
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
                period:period||"all",
                status:status||"all",
                payment:payment||"all",
                start:from,
                end:to,
                coupon:coupon.data
            })
        }

        const ReportData  = await salesReportLogic(period, status, payment, from, to)
        
        let variant = await variantLoad()
        let productModel = await productModelLoad({})
        let coupon = await couponFetcher({})
        let totalOrders = 0;
        let fullRevenue =0;
        let fullDiscount  =0 
        
        ReportData.data.forEach(order => {
            order.orderItems.forEach(item => {
                if(order.orderStatus.toUpperCase()=="COMPLETED"){
                    if(!order.returnedAt){

                        fullRevenue += item.totalPrice;
                        totalOrders += item.quantity;
                        if(item.variantId.basePrice!=null){
                            fullDiscount += (item.variantId.basePrice-item.variantId.price)*item.quantity
                        }
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
                period:period||"year",
                status:status||"all",
                payment:payment||"all",
                coupon:[],
                start:from,
                end:to,
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
            period:period||"year",
            status:status||"all",
            payment:payment||"all",
            coupon:coupon.data,
            start:from,
            end:to,
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
            fullDiscount:0,
            coupon:[],
            start:null,
            end:null,
        }) 
    }

}


