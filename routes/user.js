const express = require('express');
const router = express.Router();
const { isLoggedIn, cumstomRole } = require('../middlewares/user');
//first export this router

//we neet to create a route where we can use that sign up fuctionality
const {
    signup, 
    login, 
    logout, 
    forgotPassword, 
    passwordReset, 
    getLoggedInUserDetails, 
    changePassword, 
    updateUserDetails,
    adminAllUser,
    managerAllUser,
    admingetOneUser,
    adminUpdateOneUserDetails,
    adminDeleteOneUser
} = require('../controllers/userController'); // importing some methods


//lets create a router based on this signup
router.route('/signup').post(signup); // the signup functionnality will control '/signup' route
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/password/reset/:token').post(passwordReset);
router.route('/userdashboard').get(isLoggedIn, getLoggedInUserDetails);//this will first go and check weather user is their or not
router.route('/password/update').post(changePassword);
router.route('/userdashboard/update').post(isLoggedIn, updateUserDetails);
//admin only routs
router.route('/admin/users').get(isLoggedIn, cumstomRole('admin'), adminAllUser);//this router is only for manager only

router
    .route('/admin/users/:id')
        .get(isLoggedIn, cumstomRole('admin'), admingetOneUser)
        .put(isLoggedIn, cumstomRole('admin'), adminUpdateOneUserDetails)
        .delete(isLoggedIn, cumstomRole('admin'), adminDeleteOneUser);


//manager only user
router.route('/manager/users').get(isLoggedIn, cumstomRole('manager'), managerAllUser);

module.exports = router;    