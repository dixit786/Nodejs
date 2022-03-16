var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("Index Called " + req.session);
  var myemail = req.session.email;
  var myid = req.session._id;
  console.log(myemail);
  console.log(myid);

  //Auth
  if (!req.session.email) {
    console.log("Email Session is Set");
    res.end("Login required to Access this page");
  }
  // res.render('admin-home', { myemail: myemail });
  res.render('index', { myemail : myemail, myid:myid });
});

module.exports = router;
