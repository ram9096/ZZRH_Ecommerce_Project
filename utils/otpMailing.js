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
        subject:"One Time Password #ZZRH",
        text: `Hello 👋,
        
            Your One-Time Password (OTP) for secure verification is:

            🔐 OTP: ${otp}

            Please enter this code within the next 10 minutes to continue.

            If you did not request this, you can safely ignore this email.

            ✨ Thank you for choosing ZZRH Fashion!`
    } 
    try{
        await transporter.sendMail(mailOptions)
        console.log("Success")

    }catch(e){
        console.log("Error while sending otp ",e)
    }
}