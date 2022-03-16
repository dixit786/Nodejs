var express = require('express');
var router = express.Router();


//Call Database Model
var adminModel = require('../schema/admin_table');
const { check, validationResult } = require('express-validator');
// const { findOne } = require('../schema/admin_table');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

//Get route for the sending signup page.
router.get('/signup', function (req, res, next) {
  res.render('admin/account/register', { layout: false });
});

//Validate mobile and email field using one route.
router.post('/validate/:field', async function (req, res, next) {
  try {

    if(req.params.field == "email"){
      console.log("Email ")
      var condition = { "email": req.body.email}
    }else{

      var condition =  {"mobile" : req.body.mobile}
    }
    console.log("Find data ." ,condition)
    const adminData = await adminModel.findOne(condition)
    console.log("admin data type : -" , adminData)
    if(adminData){
      return res.send(false)
    }
    return res.send(true)
  }catch(error) {
      console.log("Error in fetch admin data " , error)
      res.send("Error in fetch data.")
  }
});


//Post signup route for storing data.  
router.post('/signup', [
  //Validation for mobile.
  check('mobile')
    .trim()
    .not()
    .isEmpty().withMessage('Please enter a mobile field.')
    .matches('[0-9]{10}').withMessage('Please enter a valid number.'),
  //Validation for name field.
  check('name')
    .trim()
    .escape()
    .not()
    .isEmpty().withMessage('Please enter a name field.')
    .isAlpha().withMessage("Please enter a valid name.")
    .isLength({ min: 5 }).withMessage("Please enter a name with surename."),
  //Validation for the email field.   
  check('email')
    .trim()
    .not()
    .isEmpty().withMessage("Please Enter an email.")
    .isEmail().withMessage("Please Enter a valid email address")
    .isLength({ min: 10 }).withMessage("Length of email should be 10 or morethan 10.")
    .normalizeEmail(),
  //Validation for the password field.
  check('password')
    .not()
    .isEmpty().withMessage("Please Enter a password.")
    .isLength({ min: 8 }).withMessage("Enter a password with length 8.")
    .matches("[0-9][A-Z][a-z]").withMessage("Password should contain uppercase, lowercase and number."),



], async function (req, res, next) {
  try{
  //Convert errors into the array. 
  let errors = validationResult(req).array();
  if (errors.length > 0) {
    // req.session.error = errors;
    // req.session.success = false;
    // res.render("formError" , {error : errors})


    try{
    //   console.log("Session  :-",req.session.error)
    //get only first name error from the error array.  
    let nameError = errors.find(function (val) {
      if (val.param == "name") {
        return val
      }
    })
    //   console.log("Name Error :- " , nameError)
    //get only first email error from the error array. 
    let emailError = errors.find(function (val) {
      if (val.param == "email") {
        return val
      }
    })
    //Get only first mobile error from the error array.
    let mobileError = errors.find(function (val) {
      if (val.param == "mobile") {
        return val
      }
    })
    //get only first password error from the error array. 
    let passwordError = errors.find(function (val) {
      if (val.param == "password") {
        return val
      }
    })
    //Collect input data for displaying in error page.
    let inputData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    }
    res.render("admin/account/register", { nameError: nameError, emailError: emailError, passwordError: passwordError, mobileError: mobileError, data: inputData, layout: false })
  }catch(error){
    console.log("Error in find validation error :- ", error)
  }
  } else {
    //Collect data for storing in data base.
    let inputData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      mobile: req.body.mobile,

    }
    //Bind the data with database.
    let data = adminModel(inputData);
    //Save data into the database.
    data.save(function (err) {
      if (err) {
        console.log("Error in Insert Record" + err);
      } else {
        console.log("Record Added");
        res.redirect("/admin/login");
      }
    })
  }
}catch(error){
  console.log("Error in admin signup route after else :- ",error)
}
  //Create an Array 


});

//admin login route
router.get('/login', function (req, res, next) {
  res.render('admin/account/login', { layout: false });
});
/*
router.post('/login', function(req, res, next) {
    console.log("Login process")
    var email = req.body.email;
    var password = req.body.password;

    console.log(req.body);
    adminModel.findOne({ "email": email }, function(err, db_admin_data) {

        console.log("Find One " + db_admin_data);

        if (db_admin_data) {
            var db_id = db_admin_data._id;
            var db_email = db_admin_data.email;
            var db_password = db_admin_data.password;

        }
        console.log("db_admin_data._id " + db_id);
        console.log("db_admin_data.email " + db_email);
        console.log("db_admin_data.password " + db_password);

        if (db_email == null) {
            console.log("If");
            res.end("Email not Found");
        } else if (db_email == email && db_password == password) {
            console.log("i m inside....")
            req.session.email = db_email;
            req.session._id = db_id;
            res.redirect('/');
        } else {
            console.log("Credentials wrong");
            res.end("Login invalid");
        }
    });
});
*/

// Check login requirements.
//Login post route.
router.post('/login', async function (req, res, next) {
  try{
    /** Find data from adminData
     * if user enter a email as a userId then below code find the data 
     * as per email id.
     * if user enter a mobile number as a userId then below code  find the data 
     * as per mobile.
     */
    let adminData = await adminModel.findOne({
      $or:[{
          'email' : req.body.emailOrMobile
        }
        ,{
          'mobile' : req.body.emailOrMobile
        }
      ]
      });
    console.log("Admin Data :- ", adminData)
    //check if data is null or not.
    if(adminData == null){
      res.send("Login invalid");
      //check whether email /mobile and pass word is correct or not.
    }else if((adminData.email == req.body.emailOrMobile || adminData.mobile == req.body.emailOrMobile) && adminData.password == req.body.password){
      req.session.email = adminData.email;
      // req.session._id = adminData._id;
      res.redirect('/');
    }
    //Send this beacause invalid credentials.
    res.send("Password or email id is not match.");
  }catch(error){
    console.log("Error in fetch admin data :- ",error)
  }
});


router.get('/forgot-password', function (req, res, next) {
  res.render('admin/account/forgot-password', { layout: false });
});

router.post('/forgot-password', function (req, res, next) {
  var email = req.body.email;

  console.log(req.body);
  adminModel.findOne({ "email": email }, function (err, db_admin_data) {

    console.log("Find One " + db_admin_data);

    if (db_admin_data) {
      var db_email = db_admin_data.email;
      var db_password = db_admin_data.password;

    }

    console.log("db_admin_data.email " + db_email);
    console.log("db_admin_data.password " + db_password);

    if (db_email == null) {
      console.log("If");
      res.end("Email not Found");
    } else if (db_email == email) {

      "use strict";
      const nodemailer = require("nodemailer");

      // async..await is not allowed in global scope, must use a wrapper
      async function main() {

        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let account = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          service: 'gmail', // true for 465, false for other ports
          auth: {
            user: 'testfor.dhanvigajjar@gmail.com',
            pass: 'Dhanvi@13'
          }
        });

        // setup email data with unicode symbols
        let mailOptions = {
          from: 'testfor.dhanvigajjar@gmail.com', // sender address
          to: db_email, // list of receivers
          subject: "Forgot Password", // Subject line
          text: "Hello your password is " + db_password, // plain text body
          html: "Hello your password is " + db_password // html body
        };

        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions)

        console.log("Message sent: %s", info.messageId);

        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        res.end("Password Sent on your Email");

      }

      main().catch(console.error);



    } else {
      console.log("Credentials wrong");
      res.end("Login invalid");
    }
  });
});

router.get('/change-password', function (req, res, next) {
  if (!req.session.email) {
    console.log("Email Session is Set");
    res.redirect('/admin/login');
  }

  res.render('admin/account/change-password', { layout: false });
});


router.post('/change-password', function (req, res, next) {
  if (!req.session.email) {
    console.log("Email Session is Set");
    res.redirect('/admin/login');
  }
  console.log("Home Called " + req.session.email);
  var myemail = req.session.email;
  var opass = req.body.opass;
  var npass = req.body.npass;
  var cpass = req.body.cpass;

  adminModel.findOne({ "email": myemail }, function (err, db_admin_data) {
    if (err) {
      console.log("Error in Old Password Fetch " + err);
    } else {
      console.log(db_admin_data);


      if (opass == db_admin_data.password) {

        if (opass == npass) {
          res.end("New Password Must be Different then Old password");
        } else {

          if (npass == cpass) {

            adminModel.findOneAndUpdate({ "email": myemail }, { $set: { "password": npass } }, function (err) {

              if (err) {
                res.end("Error in Update" + err);
              } else {

                res.send("Password Changed");
              }

            });
          } else {
            res.end("New Password and Confirm Password not match");
          }
        }

      } else {
        res.end("Old Password Not Match");
      }
    }
  });
});

//Logout Page
router.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect("/admin/login");
});

//   myprofile
router.get('/myprofile/:myid', function (req, res) {
  console.log("my id json.. : ", req.params.myid);
  // console.log("my id object : ", JSON.parse(myid))

  adminModel.findById(req.params.myid, function (err, db_admin_data) {
    if (err) {
      console.log("display Fetch Error " + err);
    } else {
      console.log(db_admin_data);

      res.render('admin/account/myprofile', { admin_data: db_admin_data });
    }
  }).lean();
});

router.get('/edit_myprofile/:myid', function (req, res) {
  console.log("my id json : ", req.params.myid);
  // console.log("my id object : ", JSON.parse(myid))

  adminModel.findById(req.params.myid, function (err, db_admin_data) {
    if (err) {
      console.log("display Fetch Error " + err);
    } else {
      console.log(db_admin_data);

      res.render('admin/account/edit_myprofile', { admin_data: db_admin_data });
    }
  }).lean();
});



router.post('/edit_myprofile/:myid', function (req, res) {

  console.log("Edit ID is" + req.params.myid);
  var id = req.params.myid;
  const mybodydata = {
    email: req.body.email
  }

  adminModel.findByIdAndUpdate(req.params.myid, mybodydata, function (err) {
    if (err) {
      console.log("Error in Record Update");
      res.send("profile updated Failed... TRY AGAIN");
      // res.redirect('/admin/account/category');
    } else {

      res.send("profile updated successfully...");
    }
  });
});


module.exports = router;