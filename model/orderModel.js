import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true
  },
  orderCode: {
    type: String,
    default:() => Math.floor(100000 + Math.random() * 900000).toString(),
    unique: true,
    index: true
  },
  shippingAddressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true
  },

  orderItems: [
    {
      variantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant",
        required: true
      },

      productName: {
        type: String,
        required: true
      },

      variantName: {
        type: String, 
        required: true
      },
      
      price: {
        type: Number,
        required: true
      },

      quantity: {
        type: Number,
        required: true,
        min: 1
      },

      totalPrice: {
        type: Number,
        required: true
      }
    }
  ],

  subTotal: {
    type: Number,
    required: true
  },

  taxAmount: {
    type: Number,
    default: 0
  },

  totalAmount: {
    type: Number,
    required: true
  },
  orderMethod:{
    type:"String",
    required:true
  },
  orderStatus: {
    type: String,
    enum: ["placed", "cancelled", "completed"],
    default: "placed"
  },
  orderShippment:{
    type:Date,
    default:null
  },
  deliveryStatus: {
    type: String,
    enum: ["pending", "shipped", "out_for_delivery", "delivered"],
    default: "pending"
  },

  orderDate: {
    type: Date,
    default: Date.now
  },
  expectedDeliveryDate: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 5);
      return date;
    }
  },
  cancelledProducts: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variant"
        }
      ],
      default: []
  },
  cancelledAt: {
    type: [
      {
        reason: {
          type: String,
          required: true
        },
        requestedAt: {
          type: Date,
          default: Date.now
        },
        cancelledBy: {
          type: String,
          enum: ["user", "admin", "system"],
          required: true
        },
        remarks: {
          type: String,
          default: null
        },
        cancelRequestStatus: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending"
        }
      }
    ],
    default: null
  }

}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
