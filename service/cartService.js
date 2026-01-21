import cartModel from "../model/cartModel.js"
import variantModel from "../model/variantModel.js";

export const cartData = async()=>{
    try{
        const data = await cartModel.find({}).populate({
            path: "variantId",
            match:{status:true},
            populate: {
                path: "productId"    
            }
        });
        
       
        
        if(!data){
            return {
                success:false,
                message:"Error while loading data try again!"
            }
        }
        return {
            success:true,
            data:data
        }
    }catch(e){

        console.error("Cart Load error:", error);
        return {
            success: false,
            message: "Something went wrong while Loading cart item"
        };
    }
}
export const addToCart = async (id,userId,qty)=>{
    try{
        if(!id||!userId){
            return {
                success:false,
                message:"Error while adding to cart try again!!!"
            }
        }
        let variantExists = await cartModel.findOne({variantId:id})
        if(variantExists){
            return {
                success:false,
                message:"Product already in cart go to cart!!"
            }
        }
        let variantStatus = await variantModel.find({_id:id,status:true,stock:{$gte:1}})
            .populate({
                path:"productId",
                populate:{
                    path:"categoryId",
                    match: { isActive: true }
                }
            })
        if(!variantStatus){

            return {
                success:false,
                message:"Product might be blocked or stock empty"
            }

        }
        let Item = new cartModel({
            userId:userId,
            quantity:qty,
            variantId:id,
        })
        await Item.save()
        return {
            success:true,
            message:"Product added successfully"
        }
    }catch(e){

        console.error("Cart add error:", error);
        return {
            success: false,
            message: "Something went wrong while adding cart item"
        };

    }
}

export const cartDelete = async (id)=>{
    try{
        if(!id){
            return {
                success:false,
                message:"Error while removing from cart try again!!!"
            }
        }
        const DeleteItem = await cartModel.deleteOne({_id:id})

        if (DeleteItem.deletedCount === 0) {
            return {
                success: false,
                message: "Cart item not found"
            };
        }

        return {
            success: true,
            message: "Item removed from cart successfully"
        };

    }catch(e){

        console.error("Cart delete error:", error);
        return {
            success: false,
            message: "Something went wrong while deleting cart item"
        };
    }
}

export const cartEdit = async(_id,variantId,quantity)=>{
    try{

        let editProgress = await cartModel.findOne({_id})

        if(!editProgress){
            return {
                success:false,
                message:"Error try again"
            }
        }

        editProgress.quantity = quantity
        await editProgress.save()
        return {
            success:true,
            message:"Cart successfully updated"
        }

    }catch(e){
        console.log(e)
    }   
}