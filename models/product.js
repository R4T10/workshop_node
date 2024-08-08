const mongoose = require("mongoose");
const products = new mongoose.Schema({
    product_name: {type: String},
    price: {type: Number},
    amount:{type:Number},
    order: [
        {order_id: mongoose.Schema.Types.ObjectId ,user_orders : String , amount : Number}
    ]
});
module.exports = mongoose.model("products",products);