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
    res.render('index', { myemail : myemail, myid:myid });
  }else{
    req.redirect("/admin");
  }
});

module.exports = router;
