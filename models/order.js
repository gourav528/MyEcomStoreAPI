const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

    shippingInfo: {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: Number,
            requried: true,
        },
        postalCode: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true
        },

    },

    user: {
        type: mongoose.Schema.ObjectId, //mongoose.Schema.Types.ObjectId
        ref: 'User',
        required: true,
    },

    orderItems: [
        {
            name: {
                type: String,
                requried: true,
            },
            quantity: {
                type: Number,
                requried: true,
            },
            image: {
                type: String,//secure_url goes here
                requried: true,
            },
            price: {
                type: Number, 
                requried: true,
            },
            product: {
                type: mongoose.Schema.ObjectId, 
                ref: 'Product',
                required: true,
            },
        }
    ],

    paymentInfo: {
        id: {
            type: String,
        }
    },

    taxAmount: {
        type: Number,
        requried: true
    },

    shoppingAmount: {
        type: Number,
        requried: true
    },

    totalAmount: {
        type: Number,
        requried: true
    },

    orderStatus: {
        type: String,
        requried: true,
        default: 'processing'
    },

    deliveredAt: {
        type: Date,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

});


module.exports = mongoose.model('Order', orderSchema);
