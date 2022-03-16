var express = require('express');
var helpers = require('handlebars-helpers');

var router = express.Router();
const { check, validationResult } = require('express-validator');


// Model Loading
var UserModel = require('../schema/user_model');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

//Add user route for display user form.
router.get('/add', function (req, res, next) {
    res.render('users/add');
});

//Add user route for add data.
router.post('/add', [
    //Check name Validation
    check('name', 'Please Enter a valid name')
        .trim()
        .escape()
        .not()
        .isEmpty().withMessage('Please enter a name field.')
        .isLength({ min: 4 }).withMessage("Please enter a name with surename.")
        .matches('[A-Z][a-z]').withMessage('Username not use uniq characters'),

    // .custom((val) => /[^A-za-z0-9\s]/g.test(val)).withMessage('Username not use uniq characters'),

    //Check email validation
    check('email')
        .not()
        .isEmpty().withMessage("Please Enter an email.")
        .isEmail().withMessage("Please enter a valid email")
        .isLength({ min: 10 }).withMessage("Length of email should be 10 or morethan 10.")
        .custom( async (val, { req }) => {
            //Check user is available or not.
            let userData =  await UserModel.find({ user_email: req.body.email })
            if(userData){
                return Promise.resolve("Email is in use.")
            }
            
        }),
    //Validation for mobile field.
    check('mobile')
        .trim()
        .not()
        .isEmpty().withMessage("Please Enter a contact number.")
        .matches('[0-9]').withMessage("Please enter a valid contact number."),
    //Validation for birthdate field.
    check('birthdate')
        .not()
        .isEmpty().withMessage('Please select a date.')
        .isDate({ format: 'YYYY-MM-DD' })
        .custom(async (val, { req }) => {
            let todaysDate = new Date()
            let currentYear = todaysDate.getFullYear()
            let birthyear = req.body.birthdate.slice(0, 4)
            if ((currentYear - birthyear) < 18) {
                // throw new Error("User is lessthan 18 years old.")
                return Promise.reject("User age should be less than 18.")
            }else{
                return true
            }
        }),
    //check validation for gender field.
    check('gender')
        .not()
        .isEmpty().withMessage("Please select an gender")
], function (req, res, next) {
    
    //Convert all errors into the array.
    const errors = validationResult(req).array();
    console.log("Errors :- ", errors)
    //Check raise any error  from the validation.
    if (errors.length > 0) {
         res.render('users/userError' , {userError : errors})
     } else {
        //Get inputData for storing.
        console.log("Hobbies :- ",req.body.hobbies)
        let inputData = {
            user_name: req.body.name,
            user_email: req.body.email,
            user_age: req.body.age,
            user_gender: req.body.gender,
            user_birthdate: req.body.birthdate,
            user_mobile: req.body.mobile,
            user_address : req.body.address,
            user_hobbies : req.body.hobbies
        }
        //Bind and save the data with schema.
        var data = UserModel(inputData);

        data.save(function (err) {
            if (err) {
                console.log("Error in Add Record" + err);
            }
                console.log("Record Added");
                res.redirect('/admin/user/add');
        })

    }

});


//Route for display user data.
router.get('/display', async function (req, res, next) {
    //Find the data from user table.

    try{
        let userData = await UserModel.find().lean()
        res.render('users/display', { mydata: userData });
    }catch(error){
        console.log("Error in display user :- ",error)
    }
});

//Route for delete the user data.
router.get('/delete/:id', function (req, res, next) {
    //Get the unique id from the url using param.
    var deleteid = req.params.id;
    //Find the data from id and delete the data.
    UserModel.findByIdAndDelete(deleteid, function (err, data) {
        if (err) {
            console.log("Error in Delete" + err);

        } else {
            console.log("Record Deleted" + deleteid);
            //Redirect to the user display.
            res.redirect('/admin/users/display');
        }
    });

});

//Get route for sending the edit page with data.
router.get('/edit/:id', async function (req, res, next) {
    //Get the unique id from the url using param.
    try{
        let data = await UserModel.findById(req.params.id).lean()
        console.log(data)
        res.render('users/edit', { mydata: data })
    }catch (error){
        res.render('users/edit', { mydata: [] })
    }
});

//Post route for the edit data into the database.
router.post('/edit/:id', function (req, res, next) {
    //Get the unique id from the url using param.
    var editid = req.params.id;
    //Collect the data from user.
    const mybodydata = {
        user_name: req.body.name,
        user_email: req.body.email,
        user_age: req.body.age,
        user_gender: req.body.gender,
        user_birthdate: req.body.birthdate,
        user_mobile: req.body.mobile,
        user_hobbies : req.body.hobbies
    }
    //find data using id and update it.
    UserModel.findByIdAndUpdate(editid, mybodydata, function (err, data) {
        if (err) {
            console.log("Error in Edit" + err)
        } else {
            console.log(data);
            res.redirect('/admin/user/display');
        }
    }).lean();
});



module.exports = router;