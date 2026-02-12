import cartModel from "../model/cartModel.js"
import whilistModel from "../model/whilistModel.js"


export const whishlistData = async ()=>{
    try{

        const data = await whilistModel.find()
            .populate({
                path:'variantId',
                populate:{
                    path:"productId"
                }
            })
        if(!data){
            return {
                success:false,
                message:"Error while loading"
            }
        }
        return {
            success:true,
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

export const wishlistUpdateLogic = async (productId,action,userId)=>{
    try{

        if(!productId || !action || !userId){
            return {
                success:false,
                message:"Error try again"
            }
        }

        if(action == "ADD"){

            const whishlist = await whilistModel.findOne({
                userId,
                variantId:productId
            })

            const cart = await cartModel.findOne({
                userId,
                variantId:productId
            })

            if(cart||whishlist){
                return {
                    success:false,
                    message:"Product in cart or wishlist"
                }
            }

            await whilistModel.create({
                userId,
                variantId: productId
            });

            return {
                success: true,
                message: "Product added to wishlist"
            };
        }
        if(action == "REMOVE"){

            await whilistModel.deleteOne({
                userId,
                variantId:productId
            })
            return {
                success:true,
                message:"Product removed from wishlist"
            }
        }

    }catch(e){
        console.log(e)
        return {
            success:false,
            message:"Server error"
        }
    }
}