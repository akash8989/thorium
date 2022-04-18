const orderModel = require("../models/ordermodel")
const userModel = require("../models/Usermodel")
const cartModel = require("../models/cartModel")
const validator=require("../validators/validator")
const mongoose = require("mongoose")

//===================================================================================================
const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId

        if (!(validator.isValidObjectId(userId))) {
            return res.status(400).send({ status: false, msg: "Provide a valid object Id" })
        }
        if (req.user.userId != userId) {
            return res.status(401).send({ status: false, msg: "userId does not match" })
        }
        let cartBody = req.body
        const { cancellable, status } = cartBody
        if(!validator.isValidrequestBody(cartBody)){
            return res.status(400).send({ status: false, msg: "provide body" }) 
        }
        if (!(validator.validstatus(status))) {
            return res.status(400).send({ status: false, msg: "Provide a valid status" })
        }
        let checkUser = await userModel.findOne({ _id: userId })
        if (!checkUser) {
            return res.status(400).send({ status: false, msg: "The user does not exist" })
        }

        let checkCart = await cartModel.findOne({ userId: userId }).
            select({ items: 1, totalPrice: 1, totalItems: 1 })
        if (!checkCart) {
            return res.status(400).send({ status: false, msg: `The cart of user ${userId} does not exist` })
        }
        let order = {
            userId: userId, items: checkCart.items,
            totalPrice: checkCart.totalPrice, totalItems: checkCart.totalItems,
            totalQuantity: checkCart.totalItems,
            cancellable: cancellable, status: status
        }
        let orderCreate = await orderModel.create(order)
        res.status(201).send({ status: true, msg: "Success", data: orderCreate })
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.createOrder = createOrder
//=====================================================================================================
const updateOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        const { orderId, status } = req.body
        if (!(validator.isValidObjectId(userId))) {
            return res.status(400).send({ status: false, msg: "Provide a valid object Id" })
        }
        if (req.user.userId != userId) {
            return res.status(401).send({ status: false, msg: "userId does not match" })
        }
        if(!validator.isValidrequestBody(req.body)){
            return res.status(400).send({ status: false, msg: "provide body" }) 
        }
        if (!validator.isValidObjectId(orderId)) {
            return res.status(400).send({ status: false, msg: "Provide a valid orderId" })
        }
        if (!validator.validstatus(status)) {
            return res.status(400).send({ status: false, msg: "Provide a valid status" })
        }
        let findUser = await userModel.findOne({ _id: userId })
        if (!findUser) {
            return res.status(400).send({ status: false, msg: "User not found" })
        }
        let findOrder = await orderModel.findOne({ _id: orderId, userId: userId })
        if (!findOrder) {
            return res.status(400).send({ status: false, msg: "orderId or userId does not match" })
        }
        let cancelCheck = findOrder.cancellable
        let statusCheck = findOrder.status
        if (statusCheck == "completed" || statusCheck == "cancelled") {
            return res.status(400).send({ status: false, msg: "status cannot be changed" })
        }
        if (cancelCheck) {
            let cancelOrder = await orderModel.findOneAndUpdate({ _id: orderId },
                { status: status }, { new: true })
            return res.status(200).send({ status: true, data: cancelOrder })
        } else {
            return res.status(400).send({ status: false, msg: "There order is not cancellable" })
        }

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.updateOrder = updateOrder