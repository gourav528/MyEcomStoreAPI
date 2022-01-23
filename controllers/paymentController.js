const BigPromise = require('../middlewares/bigPromis');
const stripe = require('stripe')(process.env.STRIPE_SECRET)


exports.captureStripePayment = BigPromise(async (req,res,next) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr',
        //automatic_payment_methods: {enabled: true},
        //this provides all the details after successful payment
        metadata: {integration_check: 'accept_a_payment'}
      });
      res.status(200).json({
          success: true,
          client_secret: paymentIntent.client_secret,
          //id can also be sent
      })
})

exports.sendStripeKey = BigPromise(async (req,res,next) => {
    res.status(200).json({
        stripeKey: process.env.STRIPE_API_KEY,
    })
})

exports.sendRazorpayKey = BigPromise(async (req,res,next) => {
    res.status(200).json({
        razorpayKey: process.env.RAZORPAY_API_KEY,
    })
})

exports.captureRazorpayPayment = BigPromise(async (req,res,next) => {
    var instance = new Razorpay({ 
        key_id: process.env.RAZORPAY_API_KEY, 
        key_secret: RAZORPAY_SECRET })

    const myOrder = await instance.orders.create({
    amount: req.body.amount,
    currency: "INR",
    receipt: "receipt#1",
    notes: {
        key1: "value3",
        key2: "value2"
    }
    })

    res.status(200).json({
        success: true,
        amount: req.body.amount,
        order: myOrder,
    })
})


