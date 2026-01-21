

export const ordersLoad = (req,res)=>{
    try{
       
        return res.render('User/manage-order',{
            isLogged:req.session.user||'',
            name:'',
            email:''
        })
    }catch(e){
        
    }
}