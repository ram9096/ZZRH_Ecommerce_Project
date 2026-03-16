
import { cartCount } from "../service/cartService.js"
import { cancelRequestLogic, getOrders, returnRequestLogic } from "../service/orderService.js"
import { findUserByEmail } from "../service/userService.js"


export const ordersLoad = async (req,res)=>{
    try{

        let id = req.session.user.id?req.session.user.id:req.session.user._id
        let user = await findUserByEmail(req.session.user.email)
        const page = req.query.page || 1
        let cart = await cartCount(req.session.user.id?req.session.user.id:req.session.user._id)
        if(!id){
            return res.redirect('/login')
        }
        let limit = 1
        let order = await getOrders({userId:id},page,2)
        
        if(!order.success){
            return res.render('User/manage-order',{
                isLogged:req.session.user||'',
                name:user.name,
                email:'',
                order:[],
                pageActive:'ORDER',
                pagination:order.pagination,
                cart:cart.count||0
            })
        }

        return res.render('User/manage-order',{
            isLogged:req.session.user||'',
            name:user.username,
            email:user.email,
            order:order.data,
            pageActive:'ORDER',
            pagination:order.pagination,
            cart:cart.count||0
        })
    }catch(e){
        console.log("Error",e)
        return res.render('User/manage-order',{
            isLogged:req.session.user||'',
            name:'',
            email:'',
            order:[],
            pageActive:'ORDER',
            pagination:order.pagination,
            cart:0
        })
    }
}
export const orderDetailsLoad = async (req,res)=>{
    try{
        let id = req.params.id
        let cart = await cartCount(req.session.user.id?req.session.user.id:req.session.user._id)
        if(!id){
            return res.redirect('/login')
        }
        let order = await getOrders({_id:id})
        
        return res.render("User/order-details",{
            isLogged:req.session.user||'',
            name:'',
            email:'',
            order:order.data,
            pageActive:'ORDER',
            cart:cart.count||0
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

export const returnRequest = async(req,res)=>{
    try{

        const {orderId,reason,remark,resolution,variant}= req.body

        const returnProgress = await returnRequestLogic(orderId,reason,remark,resolution,variant)

        if(!returnProgress.success){
            return res.status(400).json({
                success:false,
                message:returnProgress.message
            })
        }

        return res.status(200).json({
            success:true,
            message:returnProgress.message
        })
        
    }catch(e){
        console.log(e)
        return res.status(500).json({
            success:false,
            message:"Server error"
        })
    }

}