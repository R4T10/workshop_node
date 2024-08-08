var express = require('express');
var router = express.Router();
var orderModel = require('..//models/order')
const verifyToken = require('../middleware/jwt_decode')
router.get('/api/v1/orders',verifyToken,async function(req, res, next) {
    try{
      let user = await orderModel.find();
      return res.status(200).send({
          data:user,
          message:"success",
          success:true,
      });
  }catch (error){
      return res.status(500).send({
          message:"server error",
          success:false,
      })
  }
  });

  
module.exports = router;