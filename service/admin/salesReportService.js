import { getOrders } from "../orderService.js"

export const salesReportLogic = async (period, status, payment, from, to )=>{
    try{

        if(period == "custom"){

            if(payment != "all"&&status!="all"){
                const start = new Date(from + "T00:00:00.000Z");
                const end = new Date(to + "T23:59:59.999Z");
                const data  = await getOrders({

                    createdAt:{$gte:start,$lte:end},
                    orderStatus:status,
                    orderMethod:payment
                })
                
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
            }
            
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