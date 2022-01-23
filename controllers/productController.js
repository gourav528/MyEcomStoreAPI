const Product = require('../models/product');
const BigPromise = require('../middlewares/bigPromis');
const customError = require('../utils/customError');
const cloudinary = require('cloudinary');
const WhereClause = require('../utils/whereClause');


exports.addProduct = BigPromise(async (req,res,next) => {
    //images
    let imageArray = [];
    if(!req.files){
        return next(new customError('NO images', 401));
    }

    if(req.files)
    {
        for(let index = 0 ; index < req.files.photos.length; index++ ){
            let result = await cloudinary.v2.uploader.upload(
            req.files.photos[index].tempFilePath, {
                folder: "products",
            });
            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url,
            });
        }
    }

    req.body.photos = imageArray;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(200).json({
        success: true,
        product
    });

})

exports.getAllProduct = BigPromise(async (req,res,next) => {
    
    const resultPerPage = 6;
    const totalCountProduct = await Product.countDocuments() //how many total products you have got
    
    //there might be more things comming into the picture
    //so make a object out of WhereClause
    const productsObj = new WhereClause(Product.find(), req.query).search().filter();
    let products =await productsObj.base;
    const filteredProductNumber = products.length;
    
    //products.limit().skip();
    
    productsObj.pager(resultPerPage);

    products = await productsObj.base.clone(); 
    // mongoose always returns a promise 
    // so when ever you have two or more chained quries(.find() ,.search(), .filter())
    //going on use .clone 

    res.status(200).json({
        success: true,
        products,
        filteredProductNumber,
        totalCountProduct
    })
})

exports.adminUpdateOneProduct = BigPromise(async (req,res,next) => {
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new customError('No products found', 401));
    }

    let imageArray = [];
    if(req.files){

        //destroy existing images


        for(let index = 0 ; index < product.photos.length ; index++){

            const res = await cloudinary.v2.uploader.destroy(product.photos[index].id);

        }

        //upload existing images
        
        for(let index = 0 ; index < req.files.photos.length; index++ ){
            let result = await cloudinary.v2.uploader.upload(
            req.files.photos[index].tempFilePath, {
                folder: "products", //it should come from .env 
            });
            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url,
            });
        }
    }
    
    req.body.photos = imageArray;
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true,
        product
    })
})

exports.adminDeleteOneProduct = BigPromise(async (req,res,next) => {
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new customError('No products found', 401));
    }

    //destroy existing images


    for(let index = 0 ; index < product.photos.length ; index++){
        await cloudinary.v2.uploader.destroy(product.photos[index].id);
    }

    await product.remove()

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.status(200).json({
        success: true,
        message: "Product delete"
    })
})

exports.getOneProduct = BigPromise(async (req,res,next) => {
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new customError('No Product found by this id', 401));
    }

    res.status(200).json({
        success: true,
        product
    })
    
})

exports.adminGetAllProduct = BigPromise(async (req,res,next) => {
    const products = await Product.find()

    if(!products){
        return next(new customError('No product found', 400));
    }
    res.status(200).json({
        success: true,
        products
    })
})

exports.addReview = BigPromise(async (req,res,next) => {
    
    //check for past reviews
    // if there then update or else create one

    const {rating, comment, productId} = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    }
    const product = await Product.findById(productId);

    //go to the reviews array
    //and find .. we called each element as rev
    //inside rev check the user property 
    //if it matches with user._id that means user has already 
    //done the review
    const AlreadyReview = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()//converting in string beacuse it was a Bson value
    )
    
    if(AlreadyReview){
        product.reviews.forEach((review) => {
            if(review.user.toString() === req.user._id.toString()){
                review.comment = comment;
                review.rating = rating;
            }
        })
    }else{
        product.reviews.push(review);
        product.numberOfReviews = product.reviews.length;
    }

    //adjust ratings
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc,0)/ product.reviews.length

    await product.save({validateBeforeSave: false});

    res.status(200).json({
        success: true
    })
})

exports.getOnlyReviewsForOneProduct = BigPromise(async (req,res,next) =>{
    const product = await Product.findById(req.query.id)

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    })
})

exports.deleteReview = BigPromise(async (req,res,next) => {
    
    const {productId} = req.query;//to delete something you suggesttoGetItInQuery 

    const product = await Product.findById(productId);

    const reviews = product.reviews.filter(
        (rev) => rev.user.toString() === req.user._id.toString()
    )

    const numberOfReviews = reviews.lenght;

    //adjust ratings
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc,0)/ product.reviews.length

    //update the product
    await Product.findByIdAndUpdate(
        productId, {
            reviews,
            ratings,
            numberOfReviews,
        },{
            new: true,
            runValidators: true,
            useFindAndModify: false
        }
    );
    res.status(200).json({
        success: true
    })
})




