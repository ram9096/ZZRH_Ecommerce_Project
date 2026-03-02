import walletModel from "../model/walletModel.js"

export const walletTransactionLoad = async(userId)=>{
    try{

        let transaction =  await walletModel.find({userId})
        if(!transaction){
            return {
                success:false,
                message:"Error while loading"
            }
        }

        return {
            success:true,
            data:transaction
        }
    }catch(e){
        console.log(e)
        return {
            success:false,
            message:"Server error"
        }
    }
}