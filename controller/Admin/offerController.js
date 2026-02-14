
import { offerAddLogic, offerDataLoad, offerEditLogic } from "../../service/admin/offerService.js"

export const offerLoad = async (req,res)=>{
    try{

        let data = await offerDataLoad()
        
        if(!data.success){

            return res.render('Admin/offer-page',{
                activePage:'offer',
                data:[]
            })
        }

        return res.render('Admin/offer-page',{
            activePage:'offer',
            data:data.data
        })
    }catch(e){

        console.log(e)
        return res.render('Admin/offer-page',{
            activePage:'offer',
            data:[]
        })
    }
}

export const offerAddLoad = (req,res)=>{
    return res.render('Admin/offer-add-page',{
        activePage:'offer',
        error:''
    })
}
export const offerEditLoad = async (req,res)=>{
    try{
        
        let _id = req.params.id
        let offers = await offerDataLoad({_id})

        if(!offers.success){
            return res.render('Admin/offer-edit-page',{
                activePage:'offer',
                offer:[]
            })    
        }

        return res.render('Admin/offer-edit-page',{
            activePage:'offer',
            offer:offers.data
        })
    }catch(e){
        console.log(e)
        return res.render('Admin/offer-edit-page',{
            activePage:'offer',
            offer:[]
        })
    }
}
export const offerAdd = async (req,res)=>{
    try{
        const { name, discount,value,min,startDate,endDate,type } = req.body
        
        const offreProgress = await offerAddLogic(name, discount,value,min,startDate,endDate,type)
        
        if(!(offreProgress).success){
            return res.status(400).json({
                success:false,
                message:offreProgress.message
            })
        }
        return res.json({
            success:true,
            redirect:"/admin/offer"
        })
    }catch(e){
        console.log(e)
        return res.status(500).json({
            success:false,
            message:"Server error"
        })
    }
}

export const offerEdit = async (req,res)=>{
    try{
        const { _id,name, discount,value,min,startDate,endDate,type,status } = req.body
        
        const offreProgress = await offerEditLogic(_id,name, discount,value,min,startDate,endDate,type,status)
        
        if(!(offreProgress).success){
            return res.status(400).json({
                success:false,
                message:offreProgress.message
            })
        }
        return res.json({
            success:true,
            redirect:"/admin/offer"
        })
    }catch(e){
        console.log(e)
        return res.status(500).json({
            success:false,
            message:"Server error"
        })
    }
}