const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromis');
const customError = require('../utils/customError');
const jwt = require('jsonwebtoken');
 
//designig this middleware for the user portal
exports.isLoggedIn = BigPromise(async(req,res,next) => {
    const token = req.cookies.token || req.header("Authorization").replace('Bearer ', "");
    if(!token) {
        return next(new customError('Login first to access this page', 401));
    }
    //grab some thing from token

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //storeing it in req.user of anythis 
    req.user = await User.findById(decoded.id);

    next();
})
//converted this into array helps a lot
// since we are spreading this admin will go into the roles array
exports.cumstomRole = (...roles) => {
    return(req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(new customError('you are not allowed for this resouce', 402));
        }
        next()
    }
}
