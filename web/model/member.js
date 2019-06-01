var mongoose = require('mongoose');

var memberSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, 'default' : '-1'},
    name: {type: String, index : 'hashed'},
    phone: String,
    registered_date : { type : Date, index : {unique : false}, 'default' : Date.now}
});

/* 스키마에 static 메소드 추가 */
memberSchema.static('findByEmail', function(email, callback){
    return this.find({email : email}, callback);
});

module.exports = mongoose.model('member', memberSchema);