var express = require('express');

var router = express.Router();
const { check, validationResult } = require('express-validator');


// Model Loading
var UserModel = require('../schema/user_model');

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
        .not()
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
        .isDecimal().withMessage("Please Enter a valid conatct number.")
        .not()
        .isEmpty().withMessage("Please Enter a contact number.")
        .matches('[0-9]{10}').withMessage("Please enter a valid contact number."),
], function (req, res, next) {
    
    //Convert all errors into the array.
    const errors = validationResult(req).array();
    console.log("Errors :- ", errors)
    //Check raise any error  from the validation.
    if (errors) {
         res.send({"Flag" : 0,"Validation errors" : errors})
    } else {
        //Get inputData for storing.
        let inputData = {
            user_name: req.body.name,
            user_email: req.body.email,
            user_mobile: req.body.mobile,
            user_address : req.body.address
        }
        //Bind and save the data with schema.
        var data = UserModel(inputData);

        data.save(function (err) {
            if (err) {
                console.log("Error in Add Record" + err);
            }
                console.log("Record Added");
                res.send({"Flag" : 1,"Message " : "Data added."})
        })

    }
});


//Route for display user data.
router.get('/display', async function (req, res, next) {
    try{
        let userData = await UserModel.find()
        res.send({"Flag" : 1, "Data" : userData})
    }catch(error){
        res.send({"Flag" : 0 , "Error in fetch data" : error})
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
router.get('/edit/:id', function (req, res, next) {
    //Get the unique id from the url using param.
    var editid = req.params.id;
    //Find the data from id and send it with the edit page.
    UserModel.findById(editid, function (err, data) {
        if (err) {
            console.log("Error in Edit" + err)
        } else {
            res.render('users/edit', { mydata: data })
        }
    }).lean();
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
        user_mobile: req.body.mobile
    }
    //find data using id and update it.
    UserModel.findByIdAndUpdate(editid, mybodydata, function (err, data) {
        if (err) {
            console.log("Error in Edit" + err)
        } else {
            console.log(data);
            res.redirect('/admin/users/display');
        }
    }).lean();
});



module.exports = router;