import mongoose from 'mongoose';

const sellerschema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String,required:true },
  image: { type: String},
  nickName:{type:String},
  about: { type: String},

  phone:{type:Number},
  address: { type: Object },
  date: { type: Date, default: Date.now }, 
  approved:{type:Boolean,default:false}
 
}, { minimize: false });

const sellermodel = mongoose.models.seller || mongoose.model('Seller', sellerschema);

export default sellermodel;
