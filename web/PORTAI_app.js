/* fs 모듈 불러오기 */
var fs = require('fs');

/* Express 기본 모듈 불러오기 */
var express = require('express'),
    http = require('http'),
    path = require('path');

/* Express 미들웨어 불러오기 */
var bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    static = require('serve-static'),
    errorHandler = require('errorhandler');

/* 오류 핸들러 모듈 사용 */
var expressErrorHandler = require('express-error-handler');

/* 세션 미들웨어 불러오기 */
var expressSession = require('express-session');

/* Express 객체 생성 */
var app = express();

/* Express 객체 기본 속성 설정 */
app.set('port',process.env.PORT || 8080);

/* body-parser를 사용해 application/x-www-form-urlencoded 파싱 */
app.use(bodyParser.urlencoded({extended:false}));

/* body-parser를 사용해 application/json 파싱 */
app.use(bodyParser.json());

/* public 폴더를 static으로 오픈 */
app.use('/public',static(path.join(__dirname,'/public')));

/* cookie-parser 설정 */
app.use(cookieParser());

/* 세션 설정 */
app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));

/* 몽고디비 모듈 사용 */
var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

/* 데이터베이스 객체를 위한 변수 선언 */
var database;

/* 데이터베이스 스키마 객체를 위한 변수 선언 */
var MemberSchema;

/* 데이터베이스 모델 객체를 위한 변수 선언 */
var MemberModel;

/* 데이터베이스에 연결 */
function connectDB(){
    // 데이터베이스 연결 정보
    var databaseUrl = 'mongodb://localhost/PORTAI';

    // 데이터베이스 연결
    console.log('데이터베이스 연결을 시도합니다.');
    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl, {useNewUrlParser:true});
    database = mongoose.connection;
    
    database.on('error',console.error.bind(console, 'mongoose connection error.'));
    database.on('open', function(){
        console.log('데이터베이스에 연결되었습니다. : ' + databaseUrl);
        
        // 스키마 정의
        // required : 필수 속성, 필수적으로 값이 있어야하는 튜플 (NOT NULL)
        // unique : 고유한 값 (Primary key, Unique key)
        MemberSchema = mongoose.Schema({
            email: {type: String, required: true, unique: true, index: 'hashed'}, 
            password: {type: String, required: true},
            // name은 hashed 인덱싱 해놓는다.
            name: {type: String, index: 'hashed'},
            phone: String,
            // Date type으로 생성 시각과 수정 시각을 정하고 default 값으로 현재 시각을 넣어둔다.
            created_at: {type: Date, index : {unique : false}, 'default' : Date.now},
            updated_at: {type: Date, index : {unique : false}, 'default' : Date.now}
        });
        
        MemberSchema.static('findByEmail', function(email,callback){
            return this.find({email : email}, callback);
        });
        
        console.log('MemberSchema 정의함.');
        
        // MemberModel 모델 정의
        MemberModel = mongoose.model('member', MemberSchema);
        console.log('MemberModel 정의함.');
    });
    
    // 연결 끊어졌을 때 5초후 재연결
    database.on('disconnected',function(){
        console.log('연결이 끊어졌습니다. 5초 후 다시 연결합니다.');
        setInterval(connectDB, 5000);
    });
}

/* 사용자를 인증하는 함수 */
var authUser = function(database, email, password, callback){
    console.log('authUser 호출됨 : ' + email + ', ' + password);
    
    // 1. 이메일을 사용해 검색
    // 모델 객체의 findByEmail() 메소드를 호출할 때는 email 값과 콜백 함수를 전달한다.
    // 콜백 함수에서 결과 데이터를 배열로 받으면 그 배열 객체에 데이터가 있는지 확인한다.
    // 데이터가 있는 경우에는 첫 번째 배열 요소의 _doc 속성을 참조한다.
    // _doc 속성은 각 문서 객체의 정보를 담고 있어 그 안에 있는 password 속성 값을 확인할 수 있다.
    MemberModel.findByEmail(email, function(err,results){
        if(err){
            callback(err,null);
            return;
        }
        
        console.log('이메일 [%s]로 사용자 검색 결과', email);
        console.dir(results);
        
        if(results.length>0){
            console.log('이메일과 일치하는 사용자 찾음.');
            
            // 2. 비밀번호 확인
            if(results[0]._doc.password == password){
                console.log('비밀번호 일치함');
                callback(null, results);
            } else {
                console.log('비밀번호 일치하지 않음');
                callback(null, null);
            }
        } else {
            console.log('이메일과 일치하는 사용자를 찾지 못함.');
            callback(null,null);
        }
    });
}

/* 사용자를 등록하는 함수 */
var addUser = function(database, email, password, name, phone, callback){
    console.log('addUser 호출됨.');
    
    // MemberModel의 인스턴스 생성
    var member = new MemberModel({'email' : email, 'password' : password, 'name' : name, 'phone' : phone});
    
    // save()로 저장
    member.save(function(err){
        if(err){
            callback(err, null);
            return;
        }
        console.log('사용자 데이터 추가함.');
        callback(null, member);
        
    });
};

/* 라우터 객체 참조 */
var router = express.Router();

router.route('/').get(function(req,res){
	res.redirect('/public/webapp/index.html');
    res.end();
});

/* 로그인 라우팅 함수 - 데이터베이스의 정보와 비교 */
router.route('/process/login').post(function(req,res){
    console.log('/process/login 호출됨.');
    
    var paramEmail = req.body.email;
    var paramPassword = req.body.password;
    
    if(database){
        authUser(database, paramEmail, paramPassword, function(err,docs){
            if(err) {throw err;}
            
            if(docs){
                console.dir(docs);
                var username = docs[0].name;
                
                req.session.user = {
                    email : docs[0].email,
                    name : docs[0].name,
                    authorized : true
                };
                
                res.redirect('../public/webapp/index.html');
                res.end();
                
            } else {
                res.redirect('../public/webapp/Login.html');
                res.end();
            }
        });
    } else {
        res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
        res.end();
    }
});

/* 회원가입 라우팅 함수 - 데이터베이스에 정보 추가 */
router.route('/process/adduser').post(function(req, res){
    console.log('/process/adduser 호출됨.');
    
    var paramEmail = req.body.email || req.query.email;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;
    var paramPhone = req.body.phone || req.query.phone;
    
    console.log('요청 파라미터 : ' + paramEmail + ', ' + paramPassword + ', ' + paramName + ', ' + paramPhone);
    
    // 데이터베이스 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
    if(database) {
        addUser(database, paramEmail, paramPassword, paramName, paramPhone, function(err,result){
            if(err) {throw err;}
            
            // 회원 가입 후 LoginPage
            res.redirect('../public/webapp/Login.html');
            res.end();
        });
    } else { // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8}'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
});

/* 로그아웃 라우팅 함수 - 로그아웃 후 세션 삭제 */
router.route('/process/logout').post(function(req,res){
    console.log('/process/logout 호출됨.');
    
    // 로그인 된 상태
    if (req.session.user){
        console.log('로그아웃합니다.');
        
        req.session.destroy(function(err){
            if (err) {throw err;}
            
            console.log('세션을 삭제하고 로그아웃되었습니다.');
            res.redirect('../public/webapp/Login.html');
            res.end();
        });
    }
});

/* 라우터 객체 등록 */
app.use('/',router);

/* 404 오류 페이지 처리 */
var errorHandler = expressErrorHandler({
    static:{
        '404':'./public/webapp/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

/* 서버 시작 */
http.createServer(app).listen(app.get('port'),function(){
    console.log('서버가 시작되었습니다. 포트 : ',app.get('port'));
    
    // 데이터베이스 연결
    connectDB();
});

/* 카메라 */
var sys = require('util'), 
    ws = require('ws').Server;
    
var server = new ws({port: 8080});
console.log('여기오류');
clients = [];

server.on("connection", function(websocket) {
    clients.push(websocket);
    
    sys.debug(clients.length);
    
    websocket.on('message', function(data) {
        for (var i = 1; i < clients.length; i++) {
           clients[i].send(data);
        }
    });
    
    websocket.on('close', function() {
        sys.debug('close');
        
        for (var i = 0; i < clients.length; i++) {
            if (clients[i] == websocket) {
                clients.splice(i);
                break;
            }
        }
    });
});

sys.debug('Listening on port 8080');