// we always bring a model by uppercase letter
const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromis');
const customError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');
const mailHelper = require('../utils/emailHelper');
const crypto = require('crypto');
const CustomError = require('../utils/customError');
const { cumstomRole } = require('../middlewares/user');
const { resolveSoa } = require('dns');

exports.signup = BigPromise(async (req,res,next) => {

    let result;
    if(req.files){
        //if there is any file
        //extract and store in a variable
        let file = req.files.photo//frontend must call this as a photo otherwise this will not work
        result = await cloudinary.v2.uploader.upload(file.tempFilePath,{//with only file we took just only file but we also have to take the tempfilepath
            folder: "users",
            width: 150,
            crop: "scale"
        })
    }


    const {name, email, password} = req.body;

    if(!email || !name || !password){
        return  next(new customError("Name email password are required", 400)); // next keyword is used as this is passing a value to customerros

    };
    //create keyword just creates it in the database
    const user = await User.create({
        name,
        email,
        password,
        photo: {
            id: result.public_id,
            secure_url: result.secure_url,
        }
    });

    //grab a token 
    cookieToken(user, res);
})

exports.login = BigPromise(async (req,res,next) => {
    const { email, password } = req.body;
    if(!email || !password){
        return next(new customError("email password are required", 400));
    }
    //finding a user from DB
    //findOne unction
    //required is + beacuse in db we have mentioned password feild as select = true
    // which make password feild not mandatory 
    // so required feild also makes sure to send password
    const user = await User.findOne({ email }).select("+password");
    if(!user)
    {
        return next(new customError("NOt registered", 400));
    }
    // user Not User beacuse we are not looking into the DB
    // and user is an object and we run all operations on it
    const isPasswordCorrect = await user.isValidatedPassword(password);
    if(!isPasswordCorrect)
    {
        return next(new customError("Incorrect Email or Password", 400));
    }
    //if all runs fine then we send a token to the user itself
    cookieToken(user, res);

})

exports.logout = BigPromise(async (req,res,next) => {

     // hey cookie you have a token whose value will be null now

    res.cookie('token',null,{
        expires: new Date(Date.now()),
        httpOnly: true,
    })

    res.status(200).json({
        success: true,
        message: "logout successful",
    });

});

exports.forgotPassword = BigPromise(async (req,res,next) => {

   const {email} = req.body

   // check weather this email exist in the database or not
   const user = await User.findOne({email});

   if(!user) return next(new customError('Email not found', 400))
   const forgotToken = user.getforgotPasswordToken();

   //the token that is generated above is not yet being saved in the database
   await user.save({validateBeforeSave: false}); // this will not tempemporaly not check everything and save it however we want

   //crafting a url for the user to send it to his email
   const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`

   const message = `Copy paste this line on your Url and hit enter \n\n ${myUrl}`

    //sending email is very tricky so wrap it with try catch block
    try{
        await mailHelper({
            email: user.email,
            subject: "lcostore: password reset email",
            message,
        })

        res.status(200).json({
            success: true,
            message: "Email send successfully"
        })
    }catch(error){
        //very imp
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpire = undefined;
        // these values are from getforgotPasswordToken in user model 
        // we have to clear these values if anything goes wrong
        await user.save({validateBeforeSave: false});
        return next(new customError(error.message, 500))
    }

});

exports.passwordReset = BigPromise(async (req,res,next) => {
    const token = req.params.token

    //Here we encrypt the token as its not already beign encrypted
    //we use the same encrypton method as we have used previously in forgotPasswordToken
    const encryToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex"); 

    //we will find a user on the basis of the token recived 
    // this feild is as imp as email feild
    // the user we will find should have forgotPasswordExpiry in the future
    // $gt is a mongoDb query for greater than
    const user = await User.findOne({
        encryToken,
        forgotPasswordExpire: {$gt: Date.now()}
    });

    if(!user){
        return next(new customError('Token Expired ', 400))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new customError('password and confirmPassword doesnt match', 400))
    }

    user.password = req.body.password;

    user.forgotPasswordToken = undefined
    user.forgotPasswordExpire = undefined

    await user.save()

    //send of JSON response
    cookieToken(user, res);
 });

exports.getLoggedInUserDetails = BigPromise(async (req,res,next) => {
    
    //req.user doesnt exist but we have injected this property 
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
})

exports.changePassword = BigPromise(async (req,res,next) => {

    //req.user.id beacuse this route will only be available when you are logged in
    //if you are logged in the my middleware will be running and 
    //it will happen
    const userId = req.user.id
    //finding a user based on this one
    const user = await User.findById(userId).select("+password")

    //in this case user is sending me two feilds 
    //password and new password (sometimes new confirm password but not now)

    const isCorrectOldPassword = await user.isValidatedPassword(req.body.OldPassword);

    if(!isCorrectOldPassword){
        return next(new customError('Old password is incorrect', 400));
    }

    user.password = req.body.password;

    await user.save();

    //as we have saved a new password in the DB 
    //now we have to update our token

    cookieToken(user, res)

})

exports.updateUserDetails = BigPromise(async (req,res,next) => {

   const newData = {
       name: req.body.name,
       email: req.body.email
   }
   //if files are comming as they are not in our local storage 
   //we have find the user itself
   if(req.files){
        const user = await User.findById(req.user.id)
        const imageId = user.photo.id;
        //delete photo on cloudinary
        const resp = await cloudinary.v2.uploader.destroy(imageId);
        //upload photo
        result = await cloudinary.v2.uploader.upload(
            req.files.photo.tempFilePath,
            {//with only file we took just only file but we also have to take the tempfilepath
            folder: "users",
            width: 150,
            crop: "scale"
        });
        newData.photo = {
            id: result.public_id,
            secure_url: result.secure_url
        };
   }

   
   const user = await User.findByIdAndUpdate(req.user.id , newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

   res.status(200).json({
       success: true,
       
   });
});

exports.adminAllUser = BigPromise(async (req,res,next) => {
    const users = await User.find() //this users is an array of all element that it was able to find in the User model
    res.status(200).json({
        success: true,
        users,
    });
 });

 exports.admingetOneUser = BigPromise(async (req,res,next) => {
    const user = await User.findById(req.params.id);
    if(!user)
    {
        return next(new customError('no such user found', 400))
    }
    //this helps use to find user by Id
    res.status(200).json({
        success: true,
        user    
    })
 });

 exports.adminUpdateOneUserDetails = BigPromise(async (req,res,next) => {

    const newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }
    //if files are comming as they are not in our local storage 
    //we have find the user itself
        
    const user = await User.findByIdAndUpdate(req.params.id , newData, {
     new: true,
     runValidators: true,
     useFindAndModify: false,
   });
 
    res.status(200).json({
        success: true,
        
    });
 });

 exports.adminDeleteOneUser = BigPromise(async (req,res,next) => {
    const user = await User.findById(req.params.id)
    if(!user){
        return next(new customError('User not found', 401));
    }

    //deleting the photo first
    const imageId = user.photo.id;

    await cloudinary.v2.uploader.destroy(imageId);

    await user.remove()

    res.status(200).json({
        success: true,
    })

 });

exports.managerAllUser = BigPromise(async (req,res,next) => {
    const users = await User.find({role: 'user'}) //this users is an array of all element that it was able to find in the User model
    res.status(200).json({
        success: true,
        users,
    });
 });

