var fs = require("fs");
var users = JSON.parse(fs.readFileSync("./db/passwd.json"));

var findById = function(id, cb){
	process.nextTick(function(){
		var idx = id-1;
		if (users[idx]){
			cb(null, users[idx]);
		} else {
      		cb(new Error('User ' + id + ' does not exist'));
		}
	});
}
var findByUsername = function(username, cb){
	process.nextTick(function(){
		for (var i = users.length - 1; i >= 0; i--) {
			var user = users[i];
			if (user.username === username){
				return cb(null, user);
			}
		}
		return cb(null, null);
	});
}

exports.findById = findById;
exports.findByUsername = findByUsername;