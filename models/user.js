const mongoose = require("mongoose");
const user = new mongoose.Schema({
    username: {type: String},
    password: {type: String},
    firstName: {type: String},
    lastName: {type: String},
    email: {type: String},
    approve: { type: Boolean},
    orders: [{product_name : String , amount : Number,cost: Number}]
});
module.exports = mongoose.model("user",user);