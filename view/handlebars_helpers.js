var Handlebars = require("handlebars/runtime");

/**
 * Iterate over a number
 *
 * @param  {Number} n
 * @param  {String} block
 * @return {String}
 */
Handlebars.registerHelper('times', function(n, block) {
    var accum = '';
    for(var i = 0; i < n; ++i)
        accum += block.fn(i);
    return accum;
});
