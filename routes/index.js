var express = require('express');
var router = express.Router();
var userModel = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* GET home page. */
router.post('/api/v1/login', async function(req, res, next) {
  try{
    let {password, username} = req.body;
    let user = await userModel.findOne({
      username:username,
    });
    console.log(user)
    if(!user){
      return res.status(500).send({
        message: "User not found, Please register or check you username and password",
        success: false,
      })
    }
    const checkPassword = await bcrypt.compare(password,user.password);
    if(!checkPassword){
      return res.status(500).send({
        message: "login fail",
        success: false,
      })
    }
    const {_id,firstName,lastName,email} = user;
    const token = jwt.sign({_id,firstName,lastName,email},process.env.JWT_KEY)
    return res.status(200).send({
      data : {_id,username,firstName,lastName,email,token},
      message: "login success",
      success: true,
    })
  }catch (error){
    console.log(error)
    return res.status(500).send({
      message: "login fail",
      success: false,
    })
  }
});

router.post('/api/v1/register', async function(req, res, next) {
  try{
    const {username,password,firstName,lastName,email,approve} = req.body;
    let hashPassword = await bcrypt.hash(password,10);
    let newUser = new userModel({
      username,
      password: hashPassword,
      firstName,
      lastName,
      email,
      approve,
    });
    let user = await newUser.save();
    return res.status(201).send({
        data:{_id:user._id,username,firstName,lastName,email},
        message:"create success",
        success:true,
    });
}catch(error){
    console.log(error)
    return res.status(500).send({
        message:"create fail",
        success:false,
    })
}
});

router.put('/api/v1/approve/:id', async function(req, res, next) {
  try{
    let id = req.params.id;
    let user_approve = await userModel.findById(id);
    const {approve} = req.body;
    if(user_approve.approve == true){
      res.status(400).send({
        message : "This user already have been approve",
        success: false,
      })
    }else{
      user_approve.approve = approve;
      await user_approve.save();
      res.status(200).send({
        message : "Success Aprroving this user",
        success: true,
        data: user_approve
      })
    }
}catch(error){
    console.log(error)
    return res.status(500).send({
        message:"update fail",
        success:false,
    })
}
});

module.exports = router;
