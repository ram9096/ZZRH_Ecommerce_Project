import multer from "multer";
import path from 'path'
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary-config.js";
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads/images",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],

    transformation: [
      { width: 800, height: 800, crop: "limit" }, 
      { quality: "auto" }, 
      { fetch_format: "auto" } 
    ]
  },
});
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