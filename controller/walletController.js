import { cartCount } from "../service/cartService.js"
import { findUserByEmail } from "../service/userService.js"
import { walletTransactionLoad } from "../service/walletService.js"


export const walletLoad = async (req,res)=>{
    try{
        let user = await findUserByEmail(req.session.user.email)
        let transaction = await walletTransactionLoad(req.session.user.id)
        let cart = await cartCount(req.session.user.id)
        if(!user || !transaction.success){

            return res.render('User/wallet',{
                isLogged:req.session.user||'',
                name:"usern",
                email:"email",       
                mobile:"mobil",
                pageActive:"WALLET",
                balance: 0,
                transaction:[],
                cart:cart.count||0
            })
        }
        return res.render('User/wallet',{
            isLogged:req.session.user||'',
            name:"usern",
            email:"email",       
            mobile:"mobil",
            pageActive:"WALLET",
            balance: user.wallet.toFixed(2)||0,
            transaction:transaction.data,
            cart:cart.count||0
        })
    }catch(e){
        console.log(e)
        return res.redirect('/login')
    }
}