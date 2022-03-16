var express = require('express');
var router = express.Router();

//Call User Database Model
var CityModel = require('../schema/city_table');
var StateModel = require('../schema/state_table');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
}); 

router.get('/add', function(req, res, next) {

    StateModel.find(function(err, db_state_array) {
        if (err) {
            console.log("Error in Fetch Data " + err);
          } else {
            //Print Data in Console
            console.log(db_state_array);
            //Render User Array in HTML Table
            res.render('admin/city/add-city', { mydata : db_state_array });
          }
      }).lean();
});


//Add Form Processing using Post Method 
router.post('/add', function(req, res, next) {
  console.log(req.body);
 
  //Create an Array 
  const mybodydata = {
    city_name: req.body.city_name,
    _state: req.body._state
   
    }
 
    console.log("Name is "  + req.body.city_name);
    console.log("ID is "  + req.body._state);
 
var data = CityModel(mybodydata);
 
data.save(function(err) {
    if (err) {
       console.log("Error in Insert Record");
    } else {
        res.redirect('add');
    }
})

});
  router.get('/display', function(req, res, next) {
    CityModel.find(function(err, db_city_array){
        console.log("heyyy ",db_city_array);
        if (err) res.json({message: 'There are no posts here.'});

        CityModel.find({}).lean()
        .populate('_state')
          .exec(function(err, db_city_array) {
            console.log(db_city_array);
            res.render("admin/city/display-city", { mydata: db_city_array });
          })
      });
  });

//Get Single User By ID
router.get('/show/:id', function(req, res) {
  console.log(req.params.id);

  SubCategoryModel.findById(req.params.id, function(err, db_sucategory_array) {
      if (err) {
          console.log("Error in Single Record Fetch" + err);
      } else {  
          console.log(db_sucategory_array);
          res.render('admin/city/single-subcategory-record', { subcategory_array: db_sucategory_array });
      }
  });
});



//Delete User By ID
router.get('/delete/:id', function(req, res) {
  CityModel.findByIdAndDelete(req.params.id, function(err, project) {
      if (err) {
        console.log("Error in Record Delete " + err);
          res.redirect('/display');
      } else {
        console.log("Record Deleted ");
          res.redirect('/admin/city/display');
      }
  });
});

//Get Single User for Edit Record
router.get('/edit/:id', function(req, res) {
  console.log(req.params.id);
  CityModel.findById(req.params.id, function(err, db_city_array) {
      if (err) {
          console.log("Edit Fetch Error " + err);
      } else {
          console.log(db_city_array);
          StateModel.find(function(err,db_state_array){
            if(err){
              console.log(db_state_array);
            }else{
              res.render('admin/city/edit-city', { mydata: db_city_array, state_array: db_state_array });
            }
          }).lean();
      }
  }).lean();
});

//Update Record Using Post Method
router.post('/edit/:id', function(req, res) {

  console.log("Edit ID is"+ req.params.id);

  const mybodydata = {
    city_name: req.body.city_name,
    _state: req.body._state
  }

  CityModel.findByIdAndUpdate(req.params.id, mybodydata, function(err) {
      if (err) {
          console.log("Error in Record Update");
          res.redirect('/admin/city/display');
      } else {
          res.redirect('/admin/city/display');
      }
  });
});


module.exports = router;