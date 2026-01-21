import { addToCart, cartData, cartDelete, cartEdit } from "../service/cartService.js"

export const cartLoad = async (req,res)=>{
    try{
        const Cartdata  = await cartData()
        const price = Cartdata.data.reduce((val,arr)=>{
            val+=arr.variantId.price
            return val
        },0)
        if(!Cartdata.success){
            return res.render('User/cart-page',{ 
                isLogged:req.session.user||'',
                email:'',
                data:[],
                price:0
            })
        }
        return res.render('User/cart-page',{ 
            isLogged:req.session.user||'',
            email:'',
            data:Cartdata.data,
            price:price
        })
    }catch(e){

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
            return res.status(401).json({
                success:false,
                message:CartAddProgress.message
            })
        }
        return res.json({
            success:true,
            message:CartAddProgress.message
        })

    }catch(e){
        
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

            return res.status(401).json({
                success:false,
                message:cartDeleteProgress.message
            })
        }
        return res.json({
            success:true,
            redirect:"/cart"
        })

    }catch(e){

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
            return res.status(401).json({
                success:false,
                message:editProgress.message
            })
        }
        return res.json({
                success:true,
                message:editProgress.message
            })

    }catch(e){
        console.log(e)
    }
}