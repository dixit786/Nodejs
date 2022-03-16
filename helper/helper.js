const _handlebars = require('handlebars'); 
module.exports = _handlebars.registerHelper ("checkRadio", function (value, currentValue) {
    console.log("Value :- ",value)
    console.log("Current value :- ", currentValue)
    if ( value == currentValue ) {
        console.log("Checked")
       return "checked";
    }
 });


