import { findUserByEmail } from "../service/userService.js"
import { whishlistData, wishlistUpdateLogic } from "../service/whishlistService.js"


export const whishlistLoad = async (req,res)=>{
    try{

        let user = await findUserByEmail(req.session.user.email)
        let data = await whishlistData()
        
        if(!data){
            return res.render('User/whishlist',{
                isLogged:req.session.user||'',
                name:user.name,
                email:'',
                order:[],
                pageActive:"WISHLIST"
            })    
        }
        return res.render('User/whishlist',{
            isLogged:req.session.user||'',
            name:user.name,
            email:'',
            order:data.data,
            pageActive:"WISHLIST"
        })

    }catch(e){
        console.log(e)
        return res.redirect('/login')
    }
}

export const wishlistUpdate = async (req,res)=>{
    try{

        const { productId,action } = req.body
        const id = req.session.user.id

        const progress = await wishlistUpdateLogic(productId,action,id)
        console.log(progress)
        if(!progress.success){
            return res.status(400).json({
                success:false,
                message:progress.message
            })
        }
        return res.status(200).json({
            success:true,
            message:progress.message
        })
    }catch(e){

        return res.status(500).json({
            success:false,
            message:"Server error"
        })

    }
}