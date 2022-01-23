const express = require('express');
const router = express.Router();
const{addProduct, 
    getAllProduct, 
    adminGetAllProduct,
    adminUpdateOneProduct,
    getOneProduct,
    adminDeleteOneProduct,
    addReview,
    deleteReview,
    getOnlyReviewsForOneProduct,

} = require('../controllers/productController');
const { isLoggedIn, cumstomRole } = require('../middlewares/user');

router.route("/admin/product/add").post(isLoggedIn, cumstomRole('admin') ,addProduct);
router.route("/product/:id").get(getOneProduct);
router.route("/products").get(getAllProduct);
router.route("/admin/products").get(isLoggedIn, cumstomRole('admin'), adminGetAllProduct);

router.route("/review").put(isLoggedIn, addReview);
router.route("/review").delete(isLoggedIn, deleteReview);
router.route("/reviews").get(getOnlyReviewsForOneProduct);


router
    .route("/admin/product/:id")
    .put (isLoggedIn, cumstomRole('admin'), adminUpdateOneProduct)
    .delete(isLoggedIn, cumstomRole('admin'), adminDeleteOneProduct)
module.exports = router;    