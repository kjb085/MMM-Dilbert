var Handlebars = require("handlebars/runtime");  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['view.hb.html'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "        <header>\n"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? depth0.header : depth0)) != null ? stack1.isTitle : stack1),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(4, data, 0),"data":data})) != null ? stack1 : "")
    + "        </header>\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "                "
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.comic : depth0)) != null ? stack1.title : stack1), depth0))
    + "\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "                Daily Dilbert\n";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "                <div class=\"title\" style=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.customStyles : depth0)) != null ? stack1.title : stack1), depth0))
    + "\">\n                    "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.comic : depth0)) != null ? stack1.title : stack1), depth0))
    + "\n                </div>\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing;

  return "                <div class=\"stars\" style=\""
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.customStyles : depth0)) != null ? stack1.stars : stack1), depth0))
    + "\">\n"
    + ((stack1 = (helpers.times || (depth0 && depth0.times) || alias2).call(alias1,((stack1 = ((stack1 = (depth0 != null ? depth0.info : depth0)) != null ? stack1.formatedRating : stack1)) != null ? stack1.full : stack1),{"name":"times","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.times || (depth0 && depth0.times) || alias2).call(alias1,((stack1 = ((stack1 = (depth0 != null ? depth0.info : depth0)) != null ? stack1.formatedRating : stack1)) != null ? stack1.half : stack1),{"name":"times","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.times || (depth0 && depth0.times) || alias2).call(alias1,((stack1 = ((stack1 = (depth0 != null ? depth0.info : depth0)) != null ? stack1.formatedRating : stack1)) != null ? stack1.empty : stack1),{"name":"times","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "                </div>\n";
},"9":function(container,depth0,helpers,partials,data) {
    return "                        <i class=\"fa fa-star\"></i>\n";
},"11":function(container,depth0,helpers,partials,data) {
    return "                        <i class=\"fa fa-star-half-empty\" aria-hidden=\"true\"></i>\n";
},"13":function(container,depth0,helpers,partials,data) {
    return "                        <i class=\"fa fa-star-o\" aria-hidden=\"true\"></i>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.lambda, alias3=container.escapeExpression;

  return "<!-- <div id=\"mmm-dilbert\"> ## Included by module ## -->\n"
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.header : depth0)) != null ? stack1.show : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    <div class=\"mmm-dd-container\" style=\""
    + alias3(alias2(((stack1 = (depth0 != null ? depth0.customStyles : depth0)) != null ? stack1.container : stack1), depth0))
    + "\">\n        <img class=\"comic\" src=\""
    + alias3(alias2(((stack1 = (depth0 != null ? depth0.comic : depth0)) != null ? stack1.source : stack1), depth0))
    + "\" />\n        <div class=\"info\">\n"
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.info : depth0)) != null ? stack1.showTitle : stack1),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.info : depth0)) != null ? stack1.showRating : stack1),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </div>\n    </div>\n<!-- </div> -->\n";
},"useData":true});
