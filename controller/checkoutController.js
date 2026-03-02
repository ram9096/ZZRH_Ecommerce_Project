import { couponFetcher } from "../service/admin/couponService.js"
import { cartData } from "../service/cartService.js"
import { orderDetailsLoad, OrderLogic } from "../service/checkoutService.js"
import { addressFetcher, addressIdFetcher } from "../service/userProfileService.js"
import { couponLoad } from "./Admin/couponController.js"


export const checkoutLoad = async (req,res)=>{
    try{
        let user = req.session.user.id
        const cartDetails = await cartData({userId:user})
        const activeCartItems = cartDetails.data.filter((item)=>item.variantId.status===true&&item.variantId.stock>0&&item.quantity<=item.variantId.stock);
        
        const address = await addressFetcher(req.session.user.id)
        if(activeCartItems.length == 0){
            return res.redirect('/cart')
        }
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

        console.error('Error loading cart:', e)
        return res.render('User/checkout-page',{
            cart:[],
            address:[]
        })
    }
}

export const paymentMethodLoad = async (req,res)=>{
    try{
        let user = req.session.user.id
        const cartDetails = await cartData({userId:user})
        const activeCartItems = cartDetails.data.filter((item)=>item.variantId.status===true&&item.variantId.stock>0&&item.quantity<=item.variantId.stock);
        let offer = activeCartItems.reduce((val,arr)=>{
            if(arr.variantId.appliedOffer){
                val+=arr.variantId.basePrice-arr.variantId.price
            }
            return val
        },0)
        
        let coupons = await couponFetcher({})
        
        if(!cartDetails.success||activeCartItems.length==0){
            return res.redirect('/cart')
        }        
        return res.render('User/payment-method',{
            cart:activeCartItems,
            coupons:coupons.data,
            offer:offer||0
        })
    }catch(e){
        console.log("Error ",e)
        return res.render('User/payment-method',{
            cart:[],
            coupons:[],
            offer:0
        })

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
        const offer = order.data.orderItems.reduce((val,arr)=>{
            if(arr.variantId.appliedOffer){
                val+=arr.variantId.basePrice - arr.variantId.price 
            }
            return val
        },0)
        if(!order.success){
            return res.render('User/order-success',{
                order:[],
                offer:0
            })
        }
        return res.render('User/order-success',{
            order:order.data,
            offer:offer||0
        })
    }catch(e){
        console.log("Error ",e)
        return res.redirect('/login')
    }
}

export const checkoutFetcher = async (req,res)=>{
    try{

        const { id,purpose } = req.body
        let user = req.session.user.id
        const cartDetails = await cartData({userId:user})
        const activeCartItems = cartDetails.data.filter((item)=>item.variantId.status===true&&item.variantId.stock>0&&item.quantity<=item.variantId.stock);

        if(activeCartItems.length == 0){
            return res.status(400).json({
                success:false,
                message:"Cart empty error"
            })
        }
        
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
        console.log("Error",e)
        return {
            success:false,
            message:"Server error"
        }
    }
}

export const orderController = async (req,res)=>{
    try{

        const { method,coupon } = req.body
        let user = req.session.user.id
        const cartDetails = await cartData({userId:user})
        const activeCartItems = cartDetails.data.filter((item)=>item.variantId.status===true&&item.variantId.stock>0&&item.quantity<=item.variantId.stock);

        if(activeCartItems.length == 0){
            return res.status(400).json({
                success:false,
                message:"Cart empty error"
            })
        }
        
        if(!req.session.user||!method){
            return res.status(401).json({
                success:false,
                message:"Try again !!!"
            })
        }
        
        let checkoutProgress = await OrderLogic(req.session.user,method,coupon)

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
        console.log("Error",e)
        return {
            success:false,
            message:"Server error"
        }
    }
}