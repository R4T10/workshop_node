const mongoose = require("mongoose");
const orders = new mongoose.Schema({
    user_orders: { type: String },
    product: { type: String },
    amount: { type: Number },
    cost: { type: String }
}, { timestamps: true });
module.exports = mongoose.model("orders",orders);