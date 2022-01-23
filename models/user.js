const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt  = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [40, 'Name should be under 40 characters']
    },

    email: {
        type: String,
        required: [true, 'Please provide a email'],
        validate: [validator.isEmail, 'Email in correct format'],
        unique: true
    },

    password: {
        type: String,
        required: [true, 'Please provide a passord'],
        maxlength: [8, 'shoud be atleast 8 character'],
        select: false // it Makes Default as password feild will not come
    },

    role: {
        type: String,
        default: 'user'
    },

    photo: {
        id: {
            type: String
        },
        secure_url: {
            type: String
        },
    },

    forgotPasswordToken: String,
    forgotPasswordExpire: Date,

    createdAt: {
        type: Date,
        default: Date.now(),
    },

});


//encrypt password befor send
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 8)
})

//validate the password send by the user
userSchema.methods.isValidatedPassword = async function(usersendPassword){
    return bcrypt.compare(usersendPassword,this.password);
}

//create and return jwt token
userSchema.methods.getJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRY,
    });
};

// generate forgot password token (String)
userSchema.methods.getforgotPasswordToken = function() {
    const forgotToken = crypto.randomBytes(20).toString("hex");

    this.forgotPasswordToken = crypto
                .createHash("sha256")
                .update(forgotToken)
                .digest("hex");
    
    this.forgotPasswordExpire = Date.now() + 20 * 60 * 1000;

    return forgotToken;
}


module.exports = mongoose.model("User",userSchema);