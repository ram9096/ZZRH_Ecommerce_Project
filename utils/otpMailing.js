import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()
const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL,
        pass:process.env.PASSWORD
    }
})

export const sentOtp = async(email,otp)=>{
    const mailOptions = {
        from:process.env.EMAIL,
        to:email,
        subject:"One Time Password #Raftaara",
        html: `
        <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
            
            <div style="max-width:500px; margin:auto; background:#fff; padding:30px; border-radius:8px; text-align:center;">
                
                <h2 style="margin-bottom:20px;">Your One Time Password (OTP)</h2>

                <div style="font-size:24px; font-weight:bold; background:#f1f5f9; padding:12px 20px; display:inline-block; border-radius:6px; letter-spacing:3px;">
                ${otp}
                </div>

                <p style="color:#555; font-size:14px; margin-top:20px;">
                This OTP is valid for <b>2 minutes</b>. Never share it with anyone.
                </p>

                <p style="color:#777; font-size:13px;">
                If you did not request this OTP, please ignore this email.
                </p>

                <p style="margin-top:30px; font-size:12px; color:#aaa;">
                © Raftaara Fashion. All rights reserved.
                </p>

            </div>
        </div>`
    } 
    try{
        await transporter.sendMail(mailOptions)
        console.log("Success")
    }catch(e){
        console.log("Error while sending otp ",e)
    }
}