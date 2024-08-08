var express = require('express');
var router = express.Router();
var userModel = require('../models/user');
/* GET users listing. */
router.get('/',async function(req, res, next) {
  try{
    let user = await userModel.find();
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
