//jshint esversion:6
var express=require("express"),
     bodyParser = require("body-parser"),
     md5=require("md5"),
     mongoose= require("mongoose");
     // encrypt=require("mongoose-encryption");
require('dotenv').config();
var app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine",'ejs');
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true,useUnifiedTopology: true});
var userSchema= new mongoose.Schema({
     email:String,
     password:String
});
// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});
var User = new mongoose.model("User",userSchema);
app.get("/",function(req,res){
     res.render("home");
});
app.get("/login",function(req,res){
     res.render("login");
});
app.get("/register",function(req,res){
     res.render("register");
});
app.post("/register",function(req,res){
     var newUser = new User({
          email:req.body.username,
          password:md5(req.body.password)
     });
     newUser.save(function(err){
          if (err) throw err;
          res.render("secrets");
     });
});
app.post("/login",function(req,res){
     var username= req.body.username;
     var password=md5(req.body.password);
     User.findOne({email:username},function(err,found){
          if(err) throw err;
          if(found)
          {
               if(found.password==password){
                    res.render("secrets");
               }
               else{
                    res.send("Register yourself");
               }
          }
     })
});
app.listen(167);