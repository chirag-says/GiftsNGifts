import jwt from 'jsonwebtoken'
import 'dotenv/config';

const authseller=async(req,res,next)=>{
   try{

    const {stoken}=req.headers
    console.log("s",stoken)
      if(!stoken){
        return res.json({success:false,message:"auhthorize login again"})
      }
       const tokendecode=jwt.verify(stoken,process.env.JWT_SECRET)
       req.body.sellerId=tokendecode.id
       console.log("i",req.body.sellerId)
       next()
   }
   catch(e){

      console.log(e)
      res.json({success:false,message:"not defined"});
      
      }


   }
   export default authseller;