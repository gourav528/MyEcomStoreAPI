const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide Product Name '],
        trim: true, //this reduces the extra spaces from the end of the Name
        maxlength: [120, 'Product name shoud not be more than 120 characters']
    },

    price: {
        type: Number,
        required: [true, 'Please provide Product price '],
        maxlength: [5, 'Product price shoud not be more than 5 digits']
    },

    description: {
        type: String,
        required: [true, 'Please provide Product description '],
    },

    //photos will be a array not a object
    //we can have as many objects in this array
    photos: [
        {
            id: {
                type: String,
                required: true
            },
            secure_url: {
                type: String,
                required: true
            }
        }
    ],

    catagory: {
        type: String,
        required: [true, 'Please provide Product catagory '],
        //when every you want to restrict the options use enum
        enum: {
            values: [
                //sometimes dashes and spaces are too much url encoded
                'shortsleeves',
                'longsleeves',
                'sweatshirt',
                'hoodies'
            ],
            //if someOne selets any other property 
            //provide this message
            message: 'Plese select only available catagory'
        }
    },

    stock: {
        type: Number,
        required: [true, 'Add number of stocks'],
    },

    brand: {
        type: String,
        required: [true, 'Please provide Product brand '],
    },

    ratings: {
        type: Number,
        default: 0
    },

    numberOfReviews: {
        type: Number,
        default: 0
    },

    reviews: [
        {
            //HERE WE INJECT ANOTHER DOCUMENT VALUE IN ANOTHER DOCUMENT
            //only logged in users can give me ratings
            user: {
                type: mongoose.Schema.ObjectId, //in mongoose ObjectId is in D
                //this Id my come from user product or anyWhere 
                //so to specify we use ref
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true,
            },
        }
    ],

    //who is the logged in user who has created this feild
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

})

//   1. Date.now() vs 2. Date.now -- 1st one executes currently but 2nd one  

module.exports = mongoose.model('Product', productSchema);
