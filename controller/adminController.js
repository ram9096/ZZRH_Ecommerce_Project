import {  adminLoginLogic,  adminUserEditLogic, adminUsersLogic, categoryModelLoad, dataLoad, productModelLoad, variantLoad } from "../service/adminService.js";



//------------------------Page renderings---------------:

export const adminLoginLoad = (req,res)=>{
    if(req.session.isAdmin){
        return res.redirect('/admin/home')
    }
    return res.status(200).render('Admin/login-page',{error:''})
}
export const adminHomeLoad = (req,res)=>{
    if(req.session.isAdmin){
        return res.render('Admin/home-page',{
            activePage:'Dashboard'
        })
    }
    return res.redirect('/admin/login')
}

export const adminUsersLoad = async (req,res)=>{
    try{

        let filter = {}
        let sortOption = { createdAt: -1 };
        if(req.query.status == "true"){
            filter.isActive = true
        }else if(req.query.status == "false"){
            filter.isActive = false
        }
        if (req.query.search&&req.query.search.trim()!=="") {
            filter.$or = [
                { username: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } }
            ];
            }
        
        if (req.query.sort === "oldest") {
            sortOption = { createdAt: 1 };
        }
        let result = await adminUsersLogic(filter,req.query.page,sortOption);
        if(!result.success){
            return res.status(500).render("Admin/users-page", {
                data: [],
                status: req.query.status || "",
                currentPage: 1,
                totalUser: 0,
                totalPage: 1,
                search: req.query.search || "",
                sort: req.query.sort || "latest",
                error: "Failed to load users",
                activePage:'users'
            });
        }
        
        let status = String(filter.isActive)
      
        return res.status(200).render('Admin/users-page',{
            data:result.data,
            status:status,
            currentPage:result.currentPage,
            totalUser:result.totalUser,
            totalPage:result.totalPages,
            search: req.query.search || "",
            sort: req.query.sort || "latest",
            error:'',
            activePage:'users'

        })
    }catch(e){
        console.log("Error while loading: ",e)
        return res.status(500).redirect('/admin/home')
    }
}





//--------------------------controllers-------------------:

export const adminLogin = async (req,res)=>{
    try{
        const {name,password} = req.body
        let tempUserProgress = await adminLoginLogic(name,password);
        if(!tempUserProgress.success){
            return res.status(500).json({
                success:false,
                message:tempUserProgress.message
            })
        }
        req.session.isAdmin = true
        return res.status(200).json({
            success:true,
            redirect:"/admin/home"
        })
    }catch (err) {
        console.error(err);
        return res.status(500).json({
        success: false,
        message: "Server error. Please try again."
        });
    }
}




export const adminUserEdit = async(req,res)=>{
    const {isActive,id}=req.body
    let tempUserProgress = await adminUserEditLogic(isActive,id)
    if(!tempUserProgress.success){
        return res.redirect('/admin/users')
    }
    return res.redirect('/admin/users')
}

export const adminLogout = (req,res)=>{
    try{
        req.session.destroy(err => {
            if (err) {
            
            res.clearCookie('connect.sid');
            return res.redirect('/admin/home');
            }
            res.clearCookie('connect.sid');
            res.redirect('/admin/'); 
        });
    }catch(e){
        console.log("Error ",e)
        return res.redirect('/admin/home')
    }
}

