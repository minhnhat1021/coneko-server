const mongoose = require('mongoose')

// Schema để db có tính liên kết chặt chẽ hơn
const Schema = mongoose.Schema

const mongooseDelete = require('mongoose-delete')

const VnPayTransactionSchema = new Schema({
  orderId: {type: String,required: true,unique: true,index: true,  },

  roomId: { type: Array },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  checkInDate: {type: Date}, 
  checkOutDate: {type: Date}, 
  days: {type: Number},
  bookingDate: { type: Date },

  roomCharge: {type: Number}, 

  discountRate: { type: Number }, 
  discountAmount: { type: Number },
  totalPrice: { type: Number },
  amountSpent: { type: Number },
  outstandingBalance: { type: Number },
  
},{
    timestamps: true // tạo dữ liệu về thời gian tạo và xóa User
})

const VNPayTransaction = mongoose.model('VNPayTransaction', VnPayTransactionSchema);

module.exports = VNPayTransaction;
