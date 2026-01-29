import { cancelRequestLogic, getOrders } from "../service/orderService.js"


export const ordersLoad = async (req,res)=>{
    try{

        let id = req.session.user.id
        if(!id){
            return res.redirect('/login')
        }
        let order = await getOrders({userId:id})
        
        if(!order.success){
            return res.render('User/manage-order',{
                isLogged:req.session.user||'',
                name:'',
                email:'',
                order:[]
            })
        }

        return res.render('User/manage-order',{
            isLogged:req.session.user||'',
            name:'',
            email:'',
            order:order.data
        })
    }catch(e){
        console.log("Error",e)
        return res.render('User/manage-order',{
            isLogged:req.session.user||'',
            name:'',
            email:'',
            order:[]
        })
    }
}
export const orderDetailsLoad = async (req,res)=>{
    try{
        let id = req.params.id
        if(!id){
            return res.redirect('/login')
        }
        let order = await getOrders({_id:id})
        
        return res.render("User/order-details",{
            isLogged:req.session.user||'',
            name:'',
            email:'',
            order:order.data
        })
    }catch(e){
        console.log("Error",e)
        return res.redirect('/login')
    }
}

export const cancellRequest = async (req,res)=>{
    try{
        const {id,reason,remark,orderId} = req.body

        const requestProgress = await cancelRequestLogic(id,reason,remark,orderId)
        if(!requestProgress.success){
            return res.status(401).json({
                success:false,
                message:requestProgress.message
            })
        }
        return res.json({
            success:true,
            message:requestProgress.message
        })
    }catch(e){
        console.log(e)
        return res.status(401).json({
            success:false,
            message:"Server error"
        })
    }
}