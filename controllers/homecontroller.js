const Bigpromise = require('../middlewares/bigPromis');


exports.home = Bigpromise(
    async(req,res) =>{
        res.status(200).json({
            success: true,
            greeting: "Hello from API",
        });
    }      
);
exports.dummy = (req,res) =>{
    res.status(200).json({
        success: true,
        greeting: "this is Dummy",
    });
};  