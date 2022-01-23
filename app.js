const express = require("express");

require("dotenv").config();
const app = express();
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')


//for swagger documentation
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use(express.json())
app.use(express.urlencoded({extended: true}))

//
app.use(cookieParser())
app.use(fileUpload(
    //when ever some one is uploading file we will accespt the temp files
    {
        useTempFiles: true,
        tempFileDir: "/tmp/",//you can name this dir anyThing you want
    }
))

// temp check
app.set("view engine", "ejs");
app.use(morgan('tiny'))

// regular middlewares
// import all routes here
const home = require('./routes/home');
const user = require('./routes/user');  
const product = require('./routes/product');  
const payment = require('./routes/payment');  
const order = require('./routes/order');


//router middleware
app.use("/api/v1",home);
app.use("/api/v1",user);
app.use("/api/v1",product);
app.use("/api/v1",payment);
app.use("/api/v1",order);

app.get("/signuptest", (req,res) => {
    res.render('signuptest');
})
module.exports = app;