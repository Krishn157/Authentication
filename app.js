//jshint esversion:6
var express=require("express"),
     bodyParser = require("body-parser"),
     mongoose= require("mongoose"),
     session = require("express-session"),
     passport = require("passport"),
     passportLocalMongoose = require("passport-local-mongoose");
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
     password:String
});
userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});
var User = new mongoose.model("User",userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//----------------------------------------------------------------------------------------------------------------


app.get("/",function(req,res){
     res.render("home");
});
app.get("/login",function(req,res){
     res.render("login");
});
app.get("/register",function(req,res){
     res.render("register");
});
app.get("/secrets",function(req,res){
     if (req.isAuthenticated()){
       res.render("secrets");
     }
     else{
          res.redirect("/login");
     }
})
app.get("/logout",function(req,res){
     req.logout();
     res.redirect("/");
});
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
     
app.listen(167);