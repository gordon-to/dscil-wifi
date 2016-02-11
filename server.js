/*
 * Module dependencies
 */
var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , morgan = require('morgan')
  , multer = require('multer')
  , fs = require('fs')
  , Liner = require('./liner')
  , passport = require('passport')
  , Strategy = require('passport-local').Strategy
  , db = require('./db')
  , crypto = require('crypto')
  , bootstrap = require('bootstrap-styl')

var initUploads = function() {
  if( fs.existsSync('uploads') ) {
    fs.readdirSync('uploads').forEach(function(file,index){
      var curPath = 'uploads' + "/" + file;
      fs.unlinkSync(curPath);
    });
  } else {
    fs.mkdirSync('uploads');
  }
};

initUploads();


var upload = multer({ dest: 'uploads/'})

passport.use(new Strategy(
  function(username, password, cb) {
    db.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      const hash = crypto.createHash('sha256');
      hash.update(user.salt+password);
      const dgst = hash.digest('hex');
      if (user.password != dgst) { return cb(null, false); }
      console.log('we have the right password');
      return cb(null, user);
    });
  }));


passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

var app = express()
var liner

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
    .use(bootstrap())
}

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(morgan('dev'))
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
))
app.use(express.static(__dirname + '/public'))
app.use('/uploads/', express.static(__dirname + '/uploads'))

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/', 
  require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {
    res.render('index',
    { title : 'Home' }
  )
})
app.get('/upload', 
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('upload', { title : 'Upload' })
})
app.post('/file-upload', 
  require('connect-ensure-login').ensureLoggedIn(),
  upload.single('file'), 
  function(req, res, next){
    liner = new Liner()
    fs.createReadStream(req.file.path).pipe(liner)
    res.sendStatus(204).end()
})
app.get('/key',
  require('connect-ensure-login').ensureLoggedIn(), 
  function(req, res){
    if(liner) { res.send(liner.read()) }
    else { res.status(404).end()}
})
app.listen(9090)