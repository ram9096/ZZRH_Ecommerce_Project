import { error } from "console";
import { adminCategoryAddLogic, adminCategoryEditLogic, adminLoginLogic, adminProductEditLogic, adminProductsAddLogic, adminUserEditLogic, adminUsersLogic, categoryModelLoad, dataLoad, productModelLoad, variantLoad } from "../service/adminService.js";



//------------------------Page renderings---------------:

export const adminLoginLoad = (req,res)=>{
    if(req.session.isAdmin){
        return res.redirect('/admin/home')
    }
    return res.render('Admin/login-page',{error:''})
}
export const adminHomeLoad = (req,res)=>{
    if(req.session.isAdmin){
        return res.render('Admin/home-page')
    }
    return res.redirect('/admin/login')
}
export const adminCategoryLoad = async (req,res)=>{
    let filter = {}
    let sortOption = { createdAt: -1 };
    if(req.query.status == "true"){
        filter.isActive = true
    }else if(req.query.status == "false"){
        filter.isActive = false
    }
    if (req.query.search&&req.query.search.trim()!=="") {
        filter.$or = [
            { categoryName: { $regex: req.query.search, $options: "i" } }
            
        ];
    }
    let status = String(filter.isActive)
    
    if (req.query.sort === "oldest") {
        sortOption = { createdAt: 1 };
    }
    let data = await categoryModelLoad(filter,sortOption,req.query.page)
    return res.render('Admin/categories-page',{
        data:data.data,
        error:'',
        status:status,
        search:req.query.search || "",
        sort: req.query.sort || "latest",
        currentPage:data.currentPage,
        totalUser:data.totalUser,
        totalPage:data.totalPages,
    })
}
export const adminCategoryAddLoad = (req,res)=>{
    return res.render('Admin/categories-add-page',{error:''})
}
export const adminCategoryEditLoad = async (req,res)=>{
    let _id = req.params.id
    let data = await dataLoad({_id})
    return res.render('Admin/categories-edit-page',{error:'',id:_id,name:data.data[0].categoryName,description:data.data[0].description,status:data.data[0].isActive})
}
export const adminProductsLoad =  async(req,res)=>{
    let filter = {}
    let sortOption = { createdAt: -1 };
    if(req.query.status == "true"){
        filter.status = true
    }else if(req.query.status == "false"){
        filter.status = false
    }
    if (req.query.search&&req.query.search.trim()!=="") {
        filter.$or = [
            { name: { $regex: req.query.search, $options: "i" } },
            { "categoryId.categoryName": { $regex: req.query.search, $options: "i" } }
        ];
    }
    
    let status = String(filter.status)
    
    if (req.query.sort === "oldest") {
        sortOption = { createdAt: 1 };
    }
    let products = await productModelLoad(filter,sortOption,req.query.page)
    if(!products.success){
        return res.render('Admin/products-page',{error:"ERROR WHILE LOADING",data:products.data}) 
    }
    return res.render('Admin/products-page',{error:"",
        data:products.data,
        sort: req.query.sort || "latest",
        status :status,
        currentPage:products.currentPage,
        totalUser:products.totalUser,
        totalPage:products.totalPages,
        search: req.query.search || ""
    })
}
export const adminProductsAddLoad = async (req,res)=>{
    let data = await dataLoad({})
    if(!data.success){
        return res.render('Admin/products-add-page',{error:data.message})
    }
    return res.render('Admin/products-add-page',{category:data.data,error:''})
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
                error: "Failed to load users"
            });
        }
        
        let status = String(filter.isActive)
      
        return res.render('Admin/users-page',{
            data:result.data,
            status:status,
            currentPage:result.currentPage,
            totalUser:result.totalUser,
            totalPage:result.totalPages,
            search: req.query.search || "",
            sort: req.query.sort || "latest",
            error:''

        })
    }catch(e){
        console.log("Error while loading: ",e)
        return res.status(500).redirect('/admin/home')
    }
}

export const adminProductEditLoad = async(req,res)=>{
    let variants  = await variantLoad({productId:req.params.id})
    let category = await dataLoad({})
    return res.render('Admin/products-edit-page',{error:'',variant:variants.data,category:category.data})
}


//--------------------------controllers-------------------:

export const adminLogin = async (req,res)=>{
    try{
        const {name,password} = req.body
        let tempUserProgress = await adminLoginLogic(name,password);
        if(!tempUserProgress.success){
            return res.status(401).json({
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
export const adminCategoryAdd = async(req,res)=>{
    const {category_name,description,status} = req.body
    let tempCategoryProgress = await adminCategoryAddLogic(category_name,description,status)
    if(!tempCategoryProgress.success){
        return res.render('Admin/categories-add-page',{error:tempCategoryProgress.message})
    }
    return res.redirect('/admin/category')

}
export const adminCategoryEdit = async (req,res)=>{
    const {category_name,description,status} = req.body
    let _id = req.params.id
    let tempCategoryProgress = await adminCategoryEditLogic(_id,category_name,description,status)
    if(!tempCategoryProgress.success){
        return res.render('/admin/categories-page',{error:tempCategoryProgress.message})
    }
    return res.redirect('/admin/category')
}

export const adminProductsAdd = async (req,res)=>{
    try{
        let {productName,category,sku,description} = req.body
        let status = true
        const variants = {}
        for(let key in req.body){
            const match = key.match(/^variants\[(\d+)\]\.(.+)$/)
            if(match){
                if(!variants[Number(match[1])]){
                    variants[Number(match[1])] = {}
                }
                variants[Number(match[1])][match[2]] = req.body[key]
            }
        }


        for(let key in req.files){
            const match = req.files[key].fieldname.match(/^variants\[(\d+)\]\.images$/)   
            
            if(match){
                variants[Number(match[1])].images = req.files
                    .filter(file => file.fieldname === `variants[${Number(match[1])}].images`)
                    .map(file => file.path.replace(/\\/g, "/").replace(/^uploads\//, ""));
            }
        }
        let tempProductProgress = await adminProductsAddLogic(productName,category,sku,description,status,variants)
        //let data  = await dataLoad({})
        if(!tempProductProgress.success){
            return res.status(401).json({
                success:false,
                message:tempProductProgress.message
            })
        }
        return res.status(200).json({
            success:true,
            redirect:"/admin/products"
        })
    }catch(e){
        console.error("Error while adding product:", e);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
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

export const adminProductEdit = async (req,res)=>{
    try{
        
        const productData = {
            productName:req.body.productName,
            category:req.body.category,
            SKU:req.body.sku,
            description:req.body.description,
            status:req.body.status
        }
        const id = req.params.id

        const variants = {}
        for(let key in req.body){
            const match = key.match(/^variants\[(\d+)\]\.(.+)$/)
            if(match){
                const variantIndex = Number(match[1])
                if(!variants[variantIndex]){
                    variants[variantIndex] = {}
                }
                variants[variantIndex][match[2]] = req.body[key]
            }
        }
        for(let key of req.files){
            const match = key.fieldname.match(
                /^variants\[(\d+)\]\.images\[(\d+)\]$/
            );

            if (!match) continue;
            const variantIndex = Number(match[1]);
            const imageIndex = Number(match[2]);
            if (!variants[variantIndex].image) variants[variantIndex].image = {};

            variants[variantIndex].image[String(imageIndex)] =
            key.path.replace(/\\/g, "/").replace(/^uploads\//, "");
        }

        for (const i in variants) {
        ['color', 'size', 'stock', 'price', 'status'].forEach(field => {
            if (Array.isArray(variants[i][field])) {
                variants[i][field] = variants[i][field][i] ??   variants[i][field][0];
                }
            });
        }
        let productUpdateProgress = await adminProductEditLogic(productData,variants,id)
        if(!productUpdateProgress.success){
            return res.status(401).json({
                success:false,
                message:productUpdateProgress.message
            })
        }
        return res.json({
            success:true,
            redirect:"/admin/products"
        })
    }catch(e){
        console.log("SERVER ERROR: ",e)
        return res.status(500).json({
            success:false,
            message:"SERVER ERROR"
        })
    }
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

