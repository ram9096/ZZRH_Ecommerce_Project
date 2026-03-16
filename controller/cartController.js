import { addToCart, cartCount, cartData, cartDelete, cartEdit } from "../service/cartService.js"

export const cartLoad = async (req,res)=>{
    try{
        let id = req.session.user.id?req.session.user.id:req.session.user._id
        const Cartdata  = await cartData({userId:id})
        let cart = await cartCount(req.session.user.id?req.session.user.id:req.session.user._id)
        let offer = Cartdata.data.reduce((val,arr)=>{
            if(arr.variantId.status){
                if(arr.variantId.appliedOffer){
                    val += arr.variantId.basePrice-arr.variantId.price
                }
            }
            return val
        },0)
        
        const price = Cartdata.data.reduce((val,arr)=>{
            if(arr.variantId.status){
                val+=arr.variantId.price
            }
            return val
        },0)
        
        if(!Cartdata.success){
            return res.status(500).render('User/cart-page',{ 
                isLogged:req.session.user||'',
                email:'',
                data:[],
                price:0,
                cart:cart.count||0,
                offerPrice:offer.toFixed(2)||0
            })
        }

        return res.status(200).render('User/cart-page',{ 
            isLogged:req.session.user||'',
            email:'',
            data:Cartdata.data,
            price:price,
            cart:cart.count||0,
            offerPrice:offer.toFixed(2)||0
        })
    }catch(e){
        console.error('Error loading cart:', e)
        return res.status(500).render('User/cart-page',{ 
            isLogged:req.session.user||'',
            email:'',
            data:[],
            price:0,
            cart:0
        })
    }
}

export const cartAdd = async (req,res)=>{

    try{

        const { id,userId,qty } = req.body
        
        if(!id||!userId){
            return res.status(401).json({
                success:false,
                message:"Error while adding to cart"
            })
        }

        const CartAddProgress = await addToCart(id,userId,qty) 
        if(!CartAddProgress.success){
            return res.status(500).json({
                success:false,
                message:CartAddProgress.message
            })
        }
        return res.status(200).json({
            success:true,
            message:CartAddProgress.message
        })

    }catch(e){
        
        console.error('Error loading cart:', e)
        return res.redirect('/login')
        
    }
    
}

export const userCartDelete = async (req,res)=>{
    try{
        const {id} = req.body
        
        if(!id){
            return res.status(401).json({
                success:false,
                message:"Error while removing to cart"
            })
        }
        const cartDeleteProgress = await cartDelete(id);

        if(!cartDeleteProgress.success){

            return res.status(500).json({
                success:false,
                message:cartDeleteProgress.message
            })
        }
        return res.json({
            success:true,
            redirect:"/cart"
        })

    }catch(e){
        
        console.error('Error loading cart:', e)
        return res.redirect('/login')

    }

}

export const quantityUpdate = async (req,res)=>{
    try{
        const {cartId,variantId,quantity} = req.body
        if(!cartId||!variantId||!quantity){
            return res.status(401).json({
                success:false,
                message:"Fetching error"
            })
        }

        let editProgress = await cartEdit(cartId,variantId,quantity)

        if(!editProgress.success){
            return res.status(500).json({
                success:false,
                message:editProgress.message
            })
        }
        return res.json({
                success:true,
                message:editProgress.message
            })

    }catch(e){
        
        console.error('Error loading cart:', e)
        return res.redirect('/login')
    }
}

