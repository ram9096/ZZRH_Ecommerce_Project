import { couponApplyLogic, couponFetcher, couponFormCreateLogic, couponFormEditLogic } from "../../service/admin/couponService.js"

export const couponLoad = async (req,res)=>{
    try{
        let filter = {}
        let page = req.query.page || 1
        let search = req.query.search || ''
        let status = req.query.status || ''
        if(search){
            filter.code = {$regex: search, $options: 'i'}
        }
        if(status){
            filter.isActive = status == "true" ? true:false 
        }
        const data  = await couponFetcher(filter,page,3)
        
        if(!data.success){
            return res.status(400).render('Admin/coupon-page',{
                activePage:"coupon",
                data:[],
                pagination:data.pagination,
                search:search||'',
                status:status||''
            })    
        }
        
        return res.status(200).render('Admin/coupon-page',{
            activePage:"coupon",
            data:data.data,
            pagination:data.pagination,
            search:search||'',
            status:status||''
        })
    }catch(e){
        console.log(e)
       return res.status(500).render('Admin/coupon-page',{
            activePage:"coupon",
            data:[],
            pagination:data.pagination,
            search:'',
            status:''
        }) 
    }
}

export const couponEditLoad = async (req,res)=>{
    try{

        const id = req.params.id
        const data = await couponFetcher({_id:id})

        if(!data.success){
            return res.status(400).render('Admin/coupon-edit',{
                activePage:"coupon",
                data:[]
            })    
        }
        
        return res.status(200).render('Admin/coupon-edit',{
            activePage:"coupon",
            data:data.data
        })
    }catch(e){
        return res.status(400).render('Admin/coupon-edit',{
            activePage:"coupon",
            data:[]
        }) 
    }
}
export const couponFormLoad = (req,res)=>{
    return res.render('Admin/coupon-add',{
        activePage:"coupon",
    })
}

export const couponFormCreate = async (req,res)=>{
    try{

        const { code,type,value,validity,limit,max } = req.body
        
        const couponProgress = await couponFormCreateLogic(code,type,value,validity,limit,max)

        if(!couponProgress.success){

            return res.status(400).json({
                success:false,
                message:couponProgress.message
            })

        }

        return res.status(200).json({
            success:true,
            redirect:"/admin/coupons",
            message:couponProgress.message
        })

    }catch(e){
        console.log(e)
        return res.status(500).json({
            success:false,
            message:"Server error"
        })
    }
} 

export const couponFormEdit = async (req,res)=>{
    try{

        const { _id,code,type,value,validity,limit,max } = req.body
    
        const couponProgress = await couponFormEditLogic(_id,code,type,value,validity,limit,max)

        if(!couponProgress.success){

            return res.status(400).json({
                success:false,
                message:couponProgress.message
            })

        }

        return res.status(200).json({
            success:true,
            redirect:"/admin/coupons",
            message:couponProgress.message
        })

    }catch(e){
        console.log(e)
        return res.status(500).json({
            success:false,
            message:"Server error"
        })
    }
} 


export const couponApply = async (req,res)=>{
    try{

        const { code,total } = req.body
        const couponProgress = await couponApplyLogic(code,total)
        
        if(!couponProgress.success){
            return res.status(400).json({
                success:false,
                message:couponProgress.message
            })
        }

        return res.status(200).json({
            success:true,
            message:couponProgress.message,
            discount:couponProgress.discount
        })
        
    }catch(e){
        console.log(e)
        return res.status(500).json({
            success:false,
            message:"Server error"
        })
    }
}
