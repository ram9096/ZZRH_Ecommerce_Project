import {   categoryModelLoad, dataLoad, productModelLoad, variantLoad } from "../service/adminService.js";
import { adminCategoryAddLogic, adminCategoryEditLogic } from "../service/categoryService.js";



//Page renders ---------------------------------------------------------------------------------------------------------

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
        activePage:'category'
    })
}
export const adminCategoryAddLoad = (req,res)=>{
    return res.render('Admin/categories-add-page',{
        error:'',
        activePage:'category'
    })
}
export const adminCategoryEditLoad = async (req,res)=>{
    let _id = req.params.id
    let data = await dataLoad({_id})
    return res.render('Admin/categories-edit-page',{

        activePage:'category',
        error:'',
        id:_id,
        name:data.data[0].categoryName,
        description:data.data[0].description,
        status:data.data[0].isActive

    })
}



//Controllers----------------------------------------------------------------------------------------------------------


export const adminCategoryAdd = async(req,res)=>{
    try{
        const {category_name,description,status} = req.body
        let tempCategoryProgress = await adminCategoryAddLogic(category_name,description,status)

        if(!tempCategoryProgress.success){
            return res.status(401).json({

                success:false,
                message:tempCategoryProgress.message
            
            })
        }
        return res.json({
            success:true,
            redirect:"/admin/category"
        })
    }catch(e){
        console.log("Server error :\n",e)

        return res.status(500).json({
            
            success:false,
            message:"Server error try again!!"
        
        })
    }

}
export const adminCategoryEdit = async (req,res)=>{
    try{
        const {
            category_name,
            description,
            status
        } = req.body

        let _id = req.params.id


        let categoryEditProgress = await adminCategoryEditLogic(_id,category_name,description,status)

        if(!categoryEditProgress.success){

            return res.status(401).json({

                success:false,
                message:categoryEditProgress.message

            })
        }
        return res.status(200).json({

            success:true,
            redirect:"/admin/category"
        })

    }catch(e){

        console.log("Server error :",e)

        return res.status(500).json({
            success:false,
            message:"Server error try again!!"
        })
    }
}