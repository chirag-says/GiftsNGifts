import mongoose from "mongoose";
const addproductSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },

    description:{
        type:String,
        required:true,
    },

    categoryname: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    
      subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subcategory",
        required: true,
      },

    price:{
        type:Number,
        required:true,
    },

    oldprice:{
        type:Number,
        required:true,
    },
    
    discount:{
        type:Number,
        required:true,
    },
    
    ingredients:{
        type:String,
        
    },
    brand:{
        type:String,
        
    },
    size:{
        type:String,
        
    },
    additional_details:{
        type:String,
        
    },
  approved:{
        type:Boolean,
        default:false
    },
    images: [
        {
          url: {
            type: String,
            required: true
          },
          altText: {
            type: String,
            default: ''
          }
        }
      ],

      sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },

})

const addproductmodel = mongoose.model('Product',addproductSchema)
export default addproductmodel;
