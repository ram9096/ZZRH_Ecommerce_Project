import multer from "multer";
import path from 'path'
const storage = multer.diskStorage({
    destination:"uploads/images",
    filename:(req,file,cb)=>{
        const name = Date.now()+'-'+Math.round(Math.random()*1e9)
        cb(null,name+path.extname(file.originalname))
    }

})
export const upload = multer({
    storage,
    limits:{fileSize:40* 1024 * 1024},
    files: 5,
    fileFilter(req,file,cb){
        if(!file.mimetype.startsWith('image/')){
            return cb(new Error("Only image files allowed"))
        }
        cb(null,true)
    }
})