import { findUserByEmail } from "../service/userService.js"
import { walletTransactionLoad } from "../service/walletService.js"


export const walletLoad = async (req,res)=>{
    try{
        let user = await findUserByEmail(req.session.user.email)
        let transaction = await walletTransactionLoad(req.session.user.id)

        if(!user || !transaction.success){

            return res.render('User/wallet',{
                isLogged:req.session.user||'',
                name:"usern",
                email:"email",       
                mobile:"mobil",
                pageActive:"WALLET",
                balance: 0,
                transaction:[]
            })
        }
        return res.render('User/wallet',{
            isLogged:req.session.user||'',
            name:"usern",
            email:"email",       
            mobile:"mobil",
            pageActive:"WALLET",
            balance: user.wallet||0,
            transaction:transaction.data
        })
    }catch(e){
        console.log(e)
        return res.redirect('/login')
    }
}