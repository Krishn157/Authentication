//jshint esversion:6
var express=require("express"),
     bodyParser = require("body-parser"),
     mongoose= require("mongoose"),
     session = require("express-session"),
     passport = require("passport"),
     passportLocalMongoose = require("passport-local-mongoose"),
     GoogleStrategy = require("passport-google-oauth20").Strategy,
     findOrCreate=require("mongoose-findorcreate");

require('dotenv').config();
var app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine",'ejs');


//-----------------------Authentication using PassportJS----------------------------------------------------
app.use(session({
     secret:process.env.SECRET,
     resave: false,
     saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true,useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);
var userSchema= new mongoose.Schema({
     email:String,
     password:String,
     googleId:String,
     secret:String
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
var User = new mongoose.model("User",userSchema);
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
     done(null, user.id);
   });
passport.deserializeUser(function(id, done) {
     User.findById(id, function(err, user) {
       done(err, user);
     });
   });
passport.use(new GoogleStrategy({
     clientID: process.env.CLIENT_ID,
     clientSecret: process.env.CLIENT_SECRET,
     callbackURL: "http://localhost:167/auth/google/secrets",
     userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
   },
   function(accessToken, refreshToken, profile, cb) {
     console.log(profile);
     User.findOrCreate({ googleId: profile.id }, function (err, user) {
       return cb(err, user);
     });
   }
 ));
//----------------------------------------------------------------------------------------------------------------



app.get("/",function(req,res){
     res.render("home");
});
app.get("/submit",function(req,res){
     if (req.isAuthenticated()){
          res.render("submit");
        }
        else{
             res.redirect("/login");
        }
});
app.post("/submit",function(req,res){
     var submittedSecret = req.body.secret;
     User.findById(req.user.id , function(err,found){
          if(err) throw err;
          if(found){
               found.secret=submittedSecret;
               found.save(function(){
                    res.redirect("/secrets");
               });
          }
     });

});

//----------------------------------------Google Authorization---------------------------------
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));
app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect('/secrets');
  });
//-----------------------------------------------------------------------------------------------

app.get("/login",function(req,res){
     res.render("login");
});
app.get("/register",function(req,res){
     res.render("register");
});
app.get("/secrets",function(req,res){
    User.find({"secret":{$ne: null}},function(err,found){
         if(err) throw err;
         if(found)
         {
              res.render("secrets",{usersWithSecrets:found});
         }
    });
});
//--------------------------------------------------Ending User's session on Logout------------------------------
app.get("/logout",function(req,res){
     req.logout();
     res.redirect("/");
});

//---------------------------Registering new users-----------------------------------------------------------
app.post("/register",function(req,res){
     User.register({username:req.body.username},req.body.password,function(err,user){
          if(err){
               console.log(err);
               res.redirect("/register");
          }
          else{
               passport.authenticate("local")(req,res,function(){
                    res.redirect("/secrets");
               })
          }
     })
   
});

//-----------------------------------------Login Existing Users---------------------------------------------
app.post("/login",function(req,res){
     var user = new User({
          username:req.body.username,
          password:req.body.password
     });
     req.login(user,function(err){
          if(err) console.log(err);
          passport.authenticate("local")(req,res,function(){
               res.redirect("/secrets");
          })
     });
});
//----------------------------------------------------------------------------------------------------------------
app.listen(167);