import {   adminUserEditLogic, adminUsersLogic, categoryModelLoad, dataLoad, productModelLoad, variantLoad } from "../service/adminService.js";
import { adminProductEditLogic, adminProductsAddLogic } from "../service/productService.js";

//Page renderings--------------------------------------------------------------------

export const adminProductsLoad =  async(req,res)=>{
    let filter = {}
    let sortOption = { createdAt: -1 };
    
    if (req.query.search&&req.query.search.trim()!=="") {
        filter.$or = [
            { name: { $regex: req.query.search, $options: "i" } },
            { "categoryId.categoryName": { $regex: req.query.search, $options: "i" } }
        ];
    }
    
    if (req.query.sort === "oldest") {
        sortOption = { createdAt: 1 };
    }
    let products = await productModelLoad(filter,sortOption,req.query.page)
    if(!products.success){

        return res.render('Admin/products-page',{
            error:"ERROR WHILE LOADING",
            data:products.data,
            activePage:'products'
        }) 
    }
    return res.render('Admin/products-page', {
        error:"",
        data:products.data,
        sort: req.query.sort || "latest",
        currentPage:products.currentPage,
        totalUser:products.totalUser,
        totalPage:products.totalPages,
        search: req.query.search || "",
        activePage:'products'
    })
}
export const adminProductsAddLoad = async (req,res)=>{
    let data = await dataLoad({isActive:true})
    if(!data.success){

        return res.render('Admin/products-add-page',{
            error:data.message,
            activePage:'products'
        })
    }
    return res.render('Admin/products-add-page',{
        category:data.data,
        error:'',
        activePage:'products'
    })
}


export const adminProductEditLoad = async(req,res)=>{
    let variants  = await variantLoad({productId:req.params.id})
    let category = await dataLoad({isActive:true})

    return res.render('Admin/products-edit-page',{
        error:'',
        variant:variants.data,
        category:category.data,
        activePage:'products'
    })
}


//Controllers------------------------------------------------------------------------------


export const adminProductsAdd = async (req,res)=>{
    try{
        let {
            productName,
            category,
            description
        } = req.body

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
        let tempProductProgress = await adminProductsAddLogic(
            productName,
            category,
            description,
            status,
            variants
        )
       
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


export const adminProductEdit = async (req,res)=>{
    try{
        
        const productData = {
            productName:req.body.productName,
            category:req.body.category,
            description:req.body.description,
           
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

