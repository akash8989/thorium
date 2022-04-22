const userModel = require('../models/Usermodel')
const productModel = require('../models/productModel')
const cartModel = require('../models/cartModel')
const mongoose=require('mongoose')
const validator=require("../validators/validator")
// const aws=require("../validators/aws")




const createCart = async function (req, res) {
  try {
      if (req.user.userId != req.params.userId) {
          return res.status(401).send({ status: false, msg: "Invalid userId provided" })
      }
      let userId = req.params.userId
      let reqBody = req.body
      const { items } = reqBody
      if (!validator.isValidObjectId(userId)) {
          return res.status(400).send({ status: false, msg: "Invalid userId provided" })
      }
      if(!validator.isValidrequestBody(reqBody)){
          return res.status(400).send({ status: false, msg: "provide body" }) 
      }
      let findUserCart = await cartModel.findOne({ userId: userId })
      if (findUserCart) {
          if (!(items[0].productId && items[0].quantity)) {
              return res.status(400).send({ status: false, msg: "productId and quantity is mandatory" })
          }
          var pricearr = []
          var qtyarr = []

          let a = await productModel.findOne({ _id: items[0].productId, isDeleted: false })
          if (!a) {
              res.status(400).send({ status: false, msg: "The product requested is not found" })
          }
          let b = items[0].quantity
          pricearr.push(a.price * b)
          qtyarr.push(b)

          let price = pricearr.reduce((pv, cv) => pv + cv)
          let qty = qtyarr.reduce((pv, cv) => pv + cv)

          let addProduct = await cartModel.findOneAndUpdate({ _id: findUserCart._id }, { $push: { items: items[0] } }, { new: true })
          addProduct.totalPrice = addProduct.totalPrice + price
          addProduct.totalItems = addProduct.totalItems + qty

          await addProduct.save()

          return res.status(200).send({ status: true, message: "product added to cart", data: addProduct })
      } else {
          if (!(items[0].productId && items[0].quantity)) {
              return res.status(400).send({ status: false, msg: "productId and quantity is mandatory" })
          }

          var pricearr = []
          var qtyarr = []

          let a = await productModel.findOne({ _id: items[0].productId, isDeleted: false })
          if (!a) {
              res.status(400).send({ status: false, msg: "The product requested is not found" })
          }
          let b = items[0].quantity
          pricearr.push(a.price * b)
          qtyarr.push(b)

          let price = pricearr.reduce((pv, cv) => pv + cv)
          let qty = qtyarr.reduce((pv, cv) => pv + cv)
          console.log("from else")
          let cart = { userId: userId, items: items[0], totalPrice: price, totalItems: qty }
          await cartModel.create(cart)
          return res.status(201).send({ status: true, msg: "success", data: cart })
      }
  } catch (err) {
      res.status(500).send({ status: false, msg: err.message })
  }
}
module.exports.createCart=createCart

//=======--------------------------------

//============================================================================================
 const updateCart = async (req, res) => {
    try {
      //validation starts.
      if (!validator.isValidObjectId(req.params.userId))
        return res.status(400).send({ status: false, message: "Invalid userId in body" });
  
      let findUser = await userModel.findOne({ _id: req.params.userId });
      
      if (!findUser)
        return res.status(400).send({ status: false, message: "UserId does not exits" });
  
      //Authentication & authorization
      if (req.user.userId != req.params.userId)
        return res.status(401).send({ status: false, msg: "Authorised user to create cart" });
  
      //Extract body
      const { cartId, productId, removeProduct } = req.body;
      if (!validator.isValidrequestBody(req.body))
        return res.status(400).send({status: false, message: "Invalid request parameters. Please provide cart details.",
        });
  
      //cart validation
      if(!validator.isValid(cartId)){
        return res.status(400).send({ status: false, message: "cartId is required" });
      }
      if (!validator.isValidObjectId(cartId)) {
        return res.status(400).send({ status: false, message: "Invalid cartId in body" });
      }
      let findCart = await cartModel.findById({ _id: cartId });
  
      if (!findCart)
        return res.status(400).send({ status: false, message: "cartId does not exists" });
  
      //product validation
      if(!validator.isValid(productId)){
        return res.status(400).send({ status: false, message: "productId is required" });
      }
      if (!validator.isValidObjectId(productId))
        return res.status(400).send({ status: false, message: "Invalid productId in body" });
  
      let findProduct = await productModel.findOne({
        _id: productId,
        isDeleted: false,
      });
  
      if (!findProduct)
        return res.status(400).send({ status: false, message: "productId does not exists" });
  
      //finding if products exits in cart
      let isProductinCart = await cartModel.findOne({
        items: { $elemMatch: { productId: productId } },
      });
      if (!isProductinCart)
        return res.status(400).send({status: false, message: `This ${productId} product does not exists in the cart`,
        });
  
      //removeProduct validation either 0 or 1.
      if (!(!isNaN(Number(removeProduct)))){
        return res.status(400).send({status: false, message: `removeProduct should be a valid number either 0 or 1`});
      }
      //removeProduct => 0 for product remove completely, 1 for decreasing its quantity.
      if (!((removeProduct === 0) || 1)){
        return res.status(400).send({
          status: false,
          message:
            "removeProduct should be 0 (product is to be removed) or 1(quantity has to be decremented by 1) "});
        }
      let findQuantity = findCart.items.find(
        (x) => x.productId.toString() === productId
      );
      //console.log(findQuantity)
  
      if (removeProduct === 0) {
        let totalAmount =
          findCart.totalPrice - (findProduct.price * findQuantity.quantity); // substract the amount of product*quantity
  
        await cartModel.findOneAndUpdate(
          { _id: cartId },
          { $pull: { items: { productId: productId } } },
          { new: true }
        );
  
        let quantity = findCart.totalItems - 1;
        let data1 = await cartModel.findOneAndUpdate(
          { _id: cartId },
          { $set: { totalPrice: totalAmount, totalItems: quantity } },
          { new: true }
        ); //update the cart with total items and totalprice
  
        return res.status(200).send({status: true, message: `${productId} is been removed`,
          data: data1,
        });
      }
  
      // decrement quantity
      let totalAmount = findCart.totalPrice - findProduct.price;
      let itemsArr = findCart.items;
  
      for (i in itemsArr) {
        if (itemsArr[i].productId.toString() == productId) {
          itemsArr[i].quantity = itemsArr[i].quantity - 1;
  
          if (itemsArr[i].quantity < 1) {
            await cartModel.findOneAndUpdate(
              { _id: cartId },
              { $pull: { items: { productId: productId } } },
              { new: true }
            );
            let quantity = cart.totalItems - 1;
  
            let data2 = await cartModel.findOneAndUpdate(
              { _id: cartId },
              { $set: { totalPrice: totalAmount, totalItems: quantity } },
              { new: true }
            ); //update the cart with total items and totalprice
  
            return res.status(200).send({status: true,message: `No such quantity/product exist in cart`,
              data: data2,
            });
          }
        }
      }
      let data = await cartModel.findOneAndUpdate(
        { _id: cartId },
        { items: itemsArr, totalPrice: totalAmount },
        { new: true }
      );
  
      return res.status(200).send({ status: true, message: `${productId} quantity is been reduced By 1`,
        data: data});
    }
  
     catch (err) {
      return res.status(500).send({status: false, message: err.message });
    }
  }

module.exports.updateCart = updateCart
//=================================================================================================
const getCart = async function (req, res) {
    try {

        let userId = req.params.userId

        if (req.user.userId != userId) {
            return res.status(401).send({ status: false, msg: "Invalid userId provided" })

        }
        if (!validator.isValid(userId)) {
          return res.status(400).send({ status: false, message: " userId is required" });
        }
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" })
        }
        let findUser = await userModel.findOne({ _id: userId })
        if (!findUser) {
            return res.status(400).send({ status: false, msg: "User does not exist" })
        }
        let findCart = await cartModel.findOne({ userId: userId })
        // .select({ items: 1, _id: 0 })
        if (!findCart) {
            return res.status(400).send({ status: false, msg: "Cart does not exist" })
        }
        res.status(200).send({ status: true, msg : "success", data: findCart })

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.getCart = getCart
//====================================================================================================
const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (req.user.userId != userId) {
            return res.status(401).send({ status: false, msg: "Invalid userId provided" })

        }
        if (!validator.isValid(userId)) {
          return res.status(400).send({ status: false, message: " userId is required" });
        }
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "Provide a valid object Id" })
        }
        let checkCart = await cartModel.findOne({ userId: userId })
        if (!checkCart) {
            return res.status(400).send({ status: false, msg: "Cart does not exist" })
        }
        let checkUser = await userModel.findOne({ _id: userId })
        if (!checkUser) {
            return res.status(400).send({ status: false, msg: "User not found" })
        }
        let deleteItems = await cartModel.findOneAndUpdate({ userId: userId },
            { items: [], totalPrice: 0, totalItems: 0 }, { new: true })
        res.status(200).send({ status: true, msg: "Cart is empty", data: deleteItems })
    }
     catch (err) {
        res.status(500).send({ status: false, msg: err.message })

    }
}
module.exports.deleteCart = deleteCart