import { getOrders } from "../service/orderService.js"


export const ordersLoad = async (req,res)=>{
    try{

        let id = req.session.user.id
        if(!id){
            return res.redirect('/login')
        }
        let order = await getOrders(id)
        
        if(!order.success){
            return res.render('User/manage-order',{
                isLogged:req.session.user||'',
                name:'',
                email:'',
                order:[]
            })
        }

        return res.render('User/manage-order',{
            isLogged:req.session.user||'',
            name:'',
            email:'',
            order:order.data
        })
    }catch(e){

    }
}