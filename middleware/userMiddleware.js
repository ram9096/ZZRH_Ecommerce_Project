export const isAuthenticated = (req,res,next)=>{
   if(req.session && req.session.user||req.user&&req.user.isActive){
      if(req.user&&req.user.isActive){
         req.session.user = req.user
      }
        return next()
   }
   return res.redirect('/login')
}
