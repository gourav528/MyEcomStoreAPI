const express = require('express');
const router = express.Router();
const{createOrder,
    getOneOrder,
    getLoggedInOrders,
    adminGetAllOrders,
    adminUpdateOrder,
    adminDeleteOrder,
} = require('../controllers/orderController');
const { isLoggedIn, cumstomRole } = require('../middlewares/user');

router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/:id").get(isLoggedIn, getOneOrder);
//whenever you are passing some ids then be very cautious 
//and following routes should be named correctly
router.route("/myorder").get(isLoggedIn, getLoggedInOrders);
router
    .route("/admin/orders")
    .get(isLoggedIn, cumstomRole('admin'), adminGetAllOrders);

router
    .route("/admin/orders/:id")
    .put(isLoggedIn, cumstomRole('admin'), adminUpdateOrder)
    .delete(isLoggedIn, cumstomRole('admin'), adminDeleteOrder);

module.exports = router;   