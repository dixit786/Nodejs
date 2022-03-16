var express = require('express');
var router = express.Router();

//Call User Database Model
var StateModel = require('../schema/state_table');

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  res.send("<h1>Hiii</h1>")
});

router.get('/add', function(req, res, next) {
  res.render('admin/state/add-state');
});


//Add Form Processing using Post Method 
router.post('/add', function(req, res, next) {
  console.log(req.body);

  //Create an Array 
  const mybodydata = {
    state_name: req.body.state_name
    
   
}
var data = StateModel(mybodydata);
 
data.save(function(err) {
    if (err) {
       console.log("Error in Insert Record");
    } else {
        res.render('admin/state/add-state');
    }
})

});

router.get('/display', function(req, res, next) {
    StateModel.find(function(err, db_states_array) {
    if (err) {
        console.log("Error in Fetch Data " + err);
      } else {
        //Print Data in Console
        console.log(db_states_array);
        //Render User Array in HTML Table
        res.render('admin/state/display-state', { mydata: db_states_array });
      }
  }).lean();
});


//Get Single User By ID
router.get('/show/:id', function(req, res) {
  console.log(req.params.id);
  StateModel.findById(req.params.id, function(err, db_states_array) {
      if (err) {
          console.log("Error in Single Record Fetch" + err);
      } else {
          console.log(db_states_array);

          res.render('admin/category/single-category-record', { mydata: db_states_array });
      }
  });
});



//Delete User By ID
router.get('/delete/:id', function(req, res) {
    console.log("hiii");
  //var deleteid = req.params.id;
    StateModel.findByIdAndDelete(req.params.id, function(err, project) {
      if (err) {
        console.log("Error in Record Delete " + err);
          res.redirect('/state/display');
      } else {
        console.log(" Record Deleted ");
          res.redirect('/admin/state/display');
      }
  });
});



//Get Single User for Edit Record
router.get('/edit/:id', function(req, res) {
  console.log(req.params.id);
  StateModel.findById(req.params.id, function(err, db_states_array) {
      if (err) {
          console.log("Edit Fetch Error " + err);
      } else {
          console.log(db_states_array);
          res.render('admin/state/edit-state', { mydata: db_states_array });
      }
  }).lean();
});


//Update Record Using Post Method
router.post('/edit/:id', function(req, res) {

  console.log("Edit ID is"+ req.params.id);

  const mybodydata = {
    state_name: req.body.state_name 
  }

  StateModel.findByIdAndUpdate(req.params.id, mybodydata, function(err) {
      if (err) {
          console.log("Error in Record Update");
          res.redirect('/admin/state/display-state');
      } else {
        
          res.redirect('/admin/state/display');
      }
  });
});

module.exports = router;