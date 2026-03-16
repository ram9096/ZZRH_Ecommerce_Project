import orderModel from "../../model/orderModel.js";
import { productModelLoad, variantLoad } from "../adminService.js";
import { getOrders } from "../orderService.js"

export const salesReportLogic = async (period, status, payment, from, to )=>{
    try{

        if (period === "custom") {

            let filter = {};

            const start = new Date(from + "T00:00:00.000Z");
            const end = new Date(to + "T23:59:59.999Z");

            filter.createdAt = {
                $gte: start,
                $lte: end
            };

            if (status !== "all") {
                filter.orderStatus = status;
            }

            if (payment !== "all") {
                filter.orderMethod = payment;
            }

            const data = await getOrders(filter);

            if (!data.success) {
                return {
                    success: false,
                    message: "Error while loading"
                };
            }

            return {
                success: true,
                data: data.data || []
            };
        }

        let filter = {};
        let start, end;

        const now = new Date();

        switch (period) {

            case "today":
                start = new Date();
                start.setHours(0, 0, 0, 0);

                end = new Date();
                end.setHours(23, 59, 59, 999);
                break;

            case "yesterday":
                start = new Date();
                start.setDate(now.getDate() - 1);
                start.setHours(0, 0, 0, 0);

                end = new Date();
                end.setDate(now.getDate() - 1);
                end.setHours(23, 59, 59, 999);
                break;

            case "week":
                start = new Date();
                start.setDate(now.getDate() - 7);
                start.setHours(0, 0, 0, 0);

                end = new Date();
                break;

            case "month":
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date();
                break;
            case "year":
                start = new Date(now.getFullYear(), 0, 1); // Jan 1
                start.setHours(0, 0, 0, 0);

                end = new Date(now.getFullYear(), 11, 31); // Dec 31
                end.setHours(23, 59, 59, 999);
                break;
        }

        if (start && end) {

            filter.createdAt = {
                $gte: start,
                $lte: end
            };
        }
        if(status!="all"){

            filter.orderStatus = status 
        }
        if(payment!="all"){

            filter.orderMethod = payment
        }

        const data  = await getOrders(filter)
        
        if(!data.success){

            return {
                success:false,
                message:"Error while loading"
            }    
        }

        return {
            success:true,
            data:data.data||[]
        }


    }catch(e){

        console.log(e)
        return {

            success:false,
            message:"Server error"
        }
    }
}

export const chartData = async (date='week')=>{
    try{
        let filter = {}
        let start,end;
        
        const now = new Date();
        start = new Date();
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);

        end = new Date();
        filter.week = {
            start:start,
            end:end
        }

        let monthStart = new Date();
        monthStart.setDate(now.getDate() - 30);
        monthStart.setHours(0,0,0,0);

        let monthEnd = new Date();

        filter.month = {
            start: monthStart,
            end: monthEnd
        };

        let yearStart = new Date();
        yearStart.setFullYear(now.getFullYear() - 1);
        yearStart.setHours(0,0,0,0);

        let yearEnd = new Date();

        filter.year = {
            start: yearStart,
            end: yearEnd
        };

        const orders = await getOrders({})
        let fullDiscount = 0
        let fullRevenue = 0
        let totalOrders = 0
        let data = {}
        
        orders.data.forEach(order => {
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
        let revenueMap = {};
        let orderMap = {}
        orders.data.forEach(order => {
            
            if(order.createdAt>=filter.week.start  && order.createdAt<=filter.week.end &&order.orderStatus.toUpperCase()=="COMPLETED"){

                const day = order.createdAt.toLocaleDateString("en-US", { weekday: "short" });
    
                if (!revenueMap[day]) {
                    revenueMap[day] = 0;
                }
    
                revenueMap[day] += order.totalAmount;
            }
        });
        
        const labelsR = Object.keys(revenueMap);
        const valuesR = Object.values(revenueMap);
        revenueMap = {}

        orders.data.forEach(order => {
            
            if(order.createdAt>=filter.month.start  && order.createdAt<=filter.month.end&&order.orderStatus.toUpperCase()=="COMPLETED" ){

                const day = order.createdAt.toLocaleDateString("en-US", { month: "short",day:"numeric" });
    
                if (!revenueMap[day]) {
                    revenueMap[day] = 0;
                }
    
                revenueMap[day] += order.totalAmount;
            }
        });
        const labelsM = Object.keys(revenueMap);
        const valuesM = Object.values(revenueMap);

        revenueMap = {}

        orders.data.forEach(order => {
            
            if(order.createdAt>=filter.year.start  && order.createdAt<=filter.year.end &&order.orderStatus.toUpperCase()=="COMPLETED"){

                const day = order.createdAt.toLocaleDateString("en-US", { month: "short" });
    
                if (!revenueMap[day]) {
                    revenueMap[day] = 0;
                }
    
                revenueMap[day] += order.totalAmount;
            }
        });

        const labelsY = Object.keys(revenueMap);
        const valuesY = Object.values(revenueMap);

        data['revenue'] = {
            '7D': {
                labels: labelsR.reverse(),
                values: valuesR.reverse()
            },
            '30D':{
                labels: labelsM.reverse(),
                values: valuesM.reverse()
            },
            '1Y':{
                labels: labelsY.reverse(),
                values: valuesY.reverse()
            }
        };
        
        
        return {
            success:true,
            fullDiscount,
            fullRevenue,
            totalOrders,
            data:data
        }
    }catch(e){
        console.log(e)
        return {
            success:false,
            message:"Server error"
        }

    }
}

export const topSellingProduct = async ()=>{
    try{

        let order  = await orderModel
            .find({})
            .populate('userId')
            .populate('shippingAddressId')
            .populate({
                path: 'orderItems.variantId',
                populate: {
                    path: 'productId',
                    populate:{
                        path:'categoryId'
                    }
                }
            })
            .populate({
                path: 'cancelledAt.cancelledProducts',
                populate: {
                    path: 'productId',
                    model: 'Product'
                }
            });
        let product = {}
        let category = {}
        order.forEach(order => {
            order.orderItems.forEach(item => {
                if(order.orderStatus.toUpperCase()=="COMPLETED"){
                    if(!order.returnedAt){
                        if(!product[item.productName]){
                            product[item.productName] = 0
                        }
                        product[item.productName]+= item.quantity
                    }
                }
            });
        });
        const sorted = Object.fromEntries(Object.entries(product)
            .sort((a, b) => b[1] - a[1]));
        if(sorted.length>10){
            sorted.length=10
        }

        order.forEach(order => {
            order.orderItems.forEach(item => {
                if(order.orderStatus.toUpperCase()=="COMPLETED"){
                    if(!order.returnedAt){
                        if(!category[item.variantId.productId.categoryId.categoryName]){
                            category[item.variantId.productId.categoryId.categoryName] = 0
                        }
                        category[item.variantId.productId.categoryId.categoryName]+= item.quantity
                    }
                }
            });
        });
        const sortedCategory = Object.fromEntries(Object.entries(category)
            .sort((a, b) => b[1] - a[1]));
        if(sortedCategory.length>10){
            sortedCategory.length=10
        }
        return {
            success:true,
            product:sorted,
            category:sortedCategory
        }
    }catch(e){

        console.log(e)
        return {
            success:false,
            message:"Server error"
        }
    }
}