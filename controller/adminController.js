import { error } from "console";
import { adminCategoryAddLogic, adminCategoryEditLogic, adminLoginLogic, adminProductsAddLogic, adminUserEditLogic, adminUsersLogic, dataLoad, productModelLoad } from "../service/adminService.js";
import productModel from "../model/productModel.js";


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
    let data = await dataLoad({})
    return res.render('Admin/categories-page',{data:data.data,error:''})
}
export const adminCategoryAddLoad = (req,res)=>{
    return res.render('Admin/categories-add-page')
}
export const adminCategoryEditLoad = async (req,res)=>{
    let _id = req.params.id
    let data = await dataLoad({_id})
    return res.render('Admin/categories-edit-page',{id:_id,name:data.data[0].categoryName,description:data.data[0].description,status:data.data[0].isActive})
}
export const adminProductsLoad =  async(req,res)=>{
    let products = await productModelLoad()
    if(!products.success){
        return res.render('Admin/products-page',{error:"ERROR WHILE LOADING",data:products.data}) 
    }
    return res.render('Admin/products-page',{error:"",data:products.data})
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
        // if(req.query.sort == "latest"||req.query.sort == undefined){
        //     filter.createdAt = 1
        // }
        if(req.query.status == "true"){
            filter.isActive = true
        }else if(req.query.status == "false"){
            filter.isActive = false
        }
        let tempUserProgress = await adminUsersLogic(filter);
        if(!tempUserProgress.success){
            return res.redirect('/admin')
        }
        
        let status = String(filter.isActive)
        // if(Object.values(filter).length==0){
        //     status = ''
        // }
        return res.render('Admin/users-page',{data:tempUserProgress.data,status:status})
    }catch(e){
        console.log("Error while loading: ",e)
        return res.status(500).redirect('/admin/home')
    }
}


//--------------------------controllers-------------------:

export const adminLogin = async (req,res)=>{
    const {name,password} = req.body
    let tempUserProgress = await adminLoginLogic(name,password);
    if(!tempUserProgress.success){
        return res.render('Admin/login-page',{error:tempUserProgress.message})
    }
    req.session.isAdmin = true
    return res.redirect('/admin/home')
}
export const adminCategoryAdd = async(req,res)=>{
    const {category_name,description,status} = req.body
    let tempCategoryProgress = await adminCategoryAddLogic(category_name,description,status)
    if(!tempCategoryProgress.success){
        return res.redirect('/admin/category-add')
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
    let {productName,category,sku,description,price,offer,status} = req.body
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
                .map(file => file.path);
        }
    }
    let tempProductProgress = await adminProductsAddLogic(productName,category,sku,description,price,offer,status,variants)
    let data  = await dataLoad({})
    if(!tempProductProgress.success||!data){
        return res.render('Admin/products-add-page',{error:tempProductProgress.message,category:data.data})
    }
    return res.redirect('/admin/products')
}
export const adminUserEdit = async(req,res)=>{
    const {isActive,id}=req.body
    let tempUserProgress = await adminUserEditLogic(isActive,id)
    if(!tempUserProgress.success){
        return res.redirect('/admin/users')
    }
    return res.redirect('/admin/users')
}