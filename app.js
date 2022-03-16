var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const exphbs = require('express-handlebars');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const nodemailer = require("nodemailer");
const _handlebars = require('handlebars'); 
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
var helpers = require('handlebars-helpers')({
      handlebars: _handlebars
    });
let customHelper = require('./helper/helper')
// var cors = require('cors')
var mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var usersApiRouter = require('./routes/userapi');
var categoryRouter = require('./routes/category');
var subcategoryRouter = require('./routes/subcategory');
var productRouter = require('./routes/product');
var stateRouter = require('./routes/state');
var cityRouter = require('./routes/city');
var areaRouter = require('./routes/area');
var adminRouter = require('./routes/admin');
// var cartRouter = require('./routes/cart');


var app = express();

// // view engine setup
// const _handlebars = require('handlebars'); 
// var helpers = require('handlebars-helpers')({
//   handlebars: _handlebars
// });
// const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    handlebars: allowInsecurePrototypeAccess(_handlebars),
    helpers: customHelper
}));
// _handlebars.registerHelper('checkArrayValue' , function(array , value){
//     console.log("Array ", array )
//     if(array.includes(value)){
//         console.log("AAA")
//         return "checked"
//     }
// })

// _handlebars.registerHelper ("checkRadio", function (value, currentValue) {
//     console.log("Value :- ",value)
//     console.log("Current value :- ", currentValue)
//     if ( value == currentValue ) {
//         console.log("Checked")
//        return "checked";
//     }
//  });

// app.set('view engine', 'hbs');
app.set('view engine', 'handlebars');

app.use(logger('dev'));
app.use(express.json());
// app.use(cors({
//     origin: 'http://127.0.0.1:5000',
//     methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
// }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
// var corsOptions = {
//     origin: 'http://127.0.0.1:5000',
//     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
//   }
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    // cookie: { maxAge: 600000 }
}))
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://adminPanelCrud:adminPanelCrud@localhost:27017/adminPanelCrud')
    .then(() => console.log("Connection DB Open"))
    .catch((err) => console.error(err));

app.use('/', indexRouter);
app.use('/admin/user', usersRouter);
app.use('/admin/userapi', usersApiRouter);
app.use('/admin/category', categoryRouter);
app.use('/admin/subcategory', subcategoryRouter);
app.use('/admin/product', productRouter);
app.use('/admin/state', stateRouter);
app.use('/admin/city', cityRouter);
app.use('/admin/area', areaRouter);
app.use('/admin', adminRouter);
// app.use('/cart', cartRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;