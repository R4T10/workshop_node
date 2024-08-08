var express = require('express');
var router = express.Router();
var productModel = require('../models/product');
var userModel = require('../models/user');
var orderModel = require('..//models/order')
const { mongoose } = require('mongoose');
const verifyToken = require('../middleware/jwt_decode')
router.get("/api/v1/products",verifyToken,async function(req,res,next){
    try{
        const { username } = req.query;
        console.log("we got user name")
        console.log(username)
        let user_approve = await userModel.findOne({username: username})
        console.log(user_approve)
        if(user_approve.approve == true){
            let product = await productModel.find();
            console.log(product)
            return res.status(200).send({
                data:product,
                message:"Success",
                success:true,
            });
        }else{
            return res.status(500).send({
                message:"Your account haven't aprrove , please wait",
                success:false,
            });
        }

    }catch (error){
        console.log(error)
        return res.status(500).send({
            message:"Server error",
            success:false,
        })
    }
})

router.get("/api/v1/products/:id",verifyToken,async function(req,res,next){
    try{
        let id = req.params.id;
        console.log(id)
        if(!mongoose.Types.ObjectId.isValid(id)){
            console.log("I came here not there")
            return res.status(400).send({
                message:"id Invalid",
                success:false,
                error: ["id is not ObjectID"]
            });
        }
        let product = await productModel.findById(id);
        return res.status(200).send({
            data : {
                _id:product.id,product_name:product.product_name,price:product.price,amount:product.amount
            },
            message: "Success",
            success: true,
        })
    }catch (error){
        console.log(error)
        return res.status(500).send({
            message:"Server error",
            success:false,
        })
    }
})


router.post("/api/v1/products",verifyToken,async function(req,res,next){
    try{
        const {product_name,price,amount} = req.body;
        let newProduct = new productModel({
            product_name: product_name,
            price : price,
            amount: amount,
        });
        let product = await newProduct.save();
        return res.status(201).send({
            data:product,
            message:"Add new product success",
            success:true,
        });
    }catch(error){
        console.log(error)
        return res.status(500).send({
            message:"Fail to add new product",
            success:false,
        })
    }
})

router.put("/api/v1/products/:id",verifyToken,async function(req,res,next){
    try{
        let id = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).send({
                message:"id Invalid",
                success:false,
                error: ["id is not ObjectID"]
            });
        }
        const objectId = new mongoose.Types.ObjectId(id);
        await productModel.updateOne(
            {_id: objectId},
            {$set: req.body}
        );
        let product = await productModel.findById(id);
        return res.status(200).send({
            data : product,
            message: "Success to update product",
            success: true,
        })
    }catch (error){
        console.log(error);
        return res.status(500).send({
            message:"Fail to update product",
            success:false,
        })
    }
})

router.delete("/api/v1/products/:id",verifyToken,async function(req,res,next){
    try{
        let id = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).send({
                message:"id Invalid",
                success:false,
                error: ["id is not ObjectID"]
            });
        }
        const objectId = new mongoose.Types.ObjectId(id);
        await productModel.deleteOne(
            {_id: objectId},
        );
        let product = await productModel.find();
        return res.status(201).send({
            data : product,
            message: "Success to delete product",
            success: true,
        })
    }catch (error){
        console.log(error);
        return res.status(500).send({
            message:"Fail to delete product",
            success:false,
        })
    }
    
})

router.post('/api/v1/products/:id/orders',verifyToken,async function(req, res, next) {
    try{
        let id = req.params.id;
      let { username,amount_user } = req.body
      let product_store = await productModel.findById(id);
      let user_order = await userModel.findOne({username:username});
      let cost = product_store.price*amount_user
      
      let newOrder;
      if(user_order != null && product_store.amount > 0){
        user_order.orders.push({product_name : product_store.product_name , amount : amount_user,cost: cost})
        await user_order.save();
        newOrder = new orderModel({
            user_orders: username,
            product: product_store.product_name,
            amount:amount_user,
            cost : cost
          });
          let get_order_id = await newOrder.save();
          let amount =  product_store.amount - amount_user;
          if(amount > 0) {
            product_store.amount = amount
          }else if(amount_user > product_store.amount){
            return res.status(400).send({
                message:"The amount of product dosen't enough, only "+product_store.amount+" aviable in store",
                success:false,
            });
          }else{
            product_store.amount = 0
          }
          product_store.order.push({order_id: get_order_id.id ,user_orders : username , amount : amount_user})
          await product_store.save();
        }else if(product_store.amount <=0){
            return res.status(400).send({
                message:"Out of product ",
                success:false,
            });
    }
      const { _id, __v, ...orderData } = newOrder.toObject();
      return res.status(200).send({
          data:newOrder,
          message:"Success to order",
          success:true,
      });
  }catch (error){
    console.log(error)
      return res.status(500).send({
          message:"Server error",
          success:false,
      })
  }
  });

  router.get('/api/v1/products/:id/orders',verifyToken,async function(req, res, next) {
    try{
        let id = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).send({
                message:"id Invalid",
                success:false,
                error: ["id is not ObjectID"]
            });
        }
        let product = await productModel.findById(id).lean();

        product.order = product.order.map(item => {
            const { _id, ...rest } = item;
            return rest;
        });

        let total_order = product.order.length
        return res.status(200).send({
            data : {
                _id:product.id,product_name:product.product_name,price:product.price,total_order:total_order, order : product.order
            },
            message: "Success",
            success: true,
        })
    }catch (error){
        console.log(error)
        return res.status(500).send({
            message:"Server error",
            success:false,
        })
    }
  });

module.exports = router;