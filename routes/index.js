var util = require('util');

// socket test
//  fake user
var createUser = function (req) {
  var timestamp = Number(new Date());
  req.session.user_id = timestamp;
  req.session.time = timestamp;

};

exports.index = function (req, res) {
  if (!req.session) {
    req.session = {};
    createUser(req);
  }
  res.render('index.html');
};

//TODO: static 
exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};

