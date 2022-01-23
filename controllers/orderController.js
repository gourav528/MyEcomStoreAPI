const Order = require('../models/order');
const Product = require('../models/product');

const BigPromise = require('../middlewares/bigPromis');
const CustomError = require("../utils/customError");

exports.createOrder = BigPromise(async (req,res,next) => {
    //grabbing items from the body
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shoppingAmount,
        totalAmount,
         
    } = req.body;
    //create an order

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shoppingAmount,
        totalAmount,
        user: req.user._id ,  // _id not id beacuse it is comming from the mongoDb itself   
    });

    res.status(200).json({
        success: true,
        order
    });

});

exports.getOneOrder = BigPromise(async (req,res,next) => {
    //find a perticular order comming from url
    const order = await Order.findById(req.params.id).populate('user', 'name email');//populate is gather more info form user

    if(!order){
        return next(new CustomError('order dosnt exist', 401));
    }

    res.status(200).json({
        success: true,
        order,
    });

});

exports.getLoggedInOrders = BigPromise(async (req,res,next) => {
    //finding user by id then searching it in DB
    const order = await Order.find({user: req.user._id});

    if(!order){
        return next(new CustomError('order dosnt exist', 401));
    }

    res.status(200).json({
        success: true,
        order,
    });

});

exports.adminGetAllOrders = BigPromise(async (req,res,next) => {
    //finding user by id then searching it in DB
    const orders = await Order.find();

    res.status(200).json({
        success: true,
        orders,
    });

});

exports.adminUpdateOrder = BigPromise(async (req,res,next) => {
    //changing 
    const order = await Order.findById(req.params.id);

    if(order.orderStatus === 'Delivered'){
        return next(new CustomError('Order is already Deliverd'));
    }
    order.orderStatus = req.body.orderStatus;

    order.orderItems.forEach(async prod => {
        await updateProductStock(prod.product, prod.quantity);
    })

    await order.save();
    res.status(200).json({
        success: true,
        orders,
    });

});

exports.adminDeleteOrder = BigPromise(async (req,res,next) => {
    const order = await Order.findById(req.params.id);

    await order.remove();

    res.status(200).json({
        success: true,
        message: 'Order is successfully deleted',
    })
})

//both the feild are a
async function updateProductStock(productId, quantity)
{
    const product = await Product.findById(productId);

    product.stock = product.stock - quantity;

    await product.save({validateBeforSave: false});
}


