import { cartData } from "../service/cartService.js"
import { orderDetailsLoad, OrderLogic } from "../service/checkoutService.js"
import { addressFetcher, addressIdFetcher } from "../service/userProfileService.js"


export const checkoutLoad = async (req,res)=>{
    try{
        const cartDetails = await cartData()
        const activeCartItems = cartDetails.data.filter((item)=>item.variantId.status===true&&item.variantId.stock>0&&item.quantity<=item.variantId.stock);
        
        const address = await addressFetcher(req.session.user.id)

        if(!cartDetails.success){

            return res.render('User/checkout-page',{
                cart:[],
                address:[]
            })
        }
        return res.render('User/checkout-page',{
            cart:activeCartItems,
            address:address,
            id:req.session.user.id
        })
    }catch(e){

    }
}

export const paymentMethodLoad = async (req,res)=>{
    try{
        
        const cartDetails = await cartData()
        const activeCartItems = cartDetails.data.filter((item)=>item.variantId.status===true&&item.variantId.stock>0&&item.quantity<=item.variantId.stock);
        if(!cartDetails.success){

            return res.render('User/payment-method',{
                cart:[]
            })

        }        
        return res.render('User/payment-method',{
            cart:activeCartItems
        })
    }catch(e){

    }
}

export const orderSuccessLoad = async (req,res)=>{
    try{
        let orderId = req.session.user.orderId
        
        if(!orderId){
            return res.render('User/order-success',{
                order:[]
            })
        }
        const order = await orderDetailsLoad(orderId)
        
        if(!order.success){
            return res.render('User/order-success',{
                order:[]
            })
        }
        return res.render('User/order-success',{
            order:order.data
        })
    }catch(e){

    }
}

export const checkoutFetcher = async (req,res)=>{
    try{

        const { id,purpose } = req.body
        
        if(!id||!purpose){
            return res.status(401).json({
                success:false,
                message:"Fetching error"
            })
        }

        if(purpose == "DATA_FETCH"){

            const address = await addressIdFetcher(id)
            
            return res.json({
                success:true,
                address:address
            })
        }

        req.session.user.addressId = id
        return res.json({
            success:true,
            redirect:"/checkout/method"
        })

    }catch(e){
        console.log(e)
    }
}

export const orderController = async (req,res)=>{
    try{

        const { method } = req.body

        if(!req.session.user||!method){
            return res.status(401).json({
                success:false,
                message:"Try again !!!"
            })
        }
        
        let checkoutProgress = await OrderLogic(req.session.user,method)

        if(!checkoutProgress.success){
            return res.status(401).json({
                success:false,
                message:checkoutProgress.message
            })
        }
        req.session.user.orderId = checkoutProgress.id
        
        return res.json({
            success:true,
            redirect:"/checkout/order-confirmed"
        })

    }catch(e){
        console.log(e)
    }
}