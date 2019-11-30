//jshint esversion:6
var express=require("express"),
     bodyParser = require("body-parser"),
     // md5=require("md5"),
     bcrypt=require("bcrypt"),
     mongoose= require("mongoose");
     // encrypt=require("mongoose-encryption");
require('dotenv').config();
const saltrounds = 10;
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
     bcrypt.hash(req.body.password,saltrounds,function(err,hash){
          var newUser = new User({
               email:req.body.username,
               password:hash
          });
          newUser.save(function(err){
               if (err) throw err;
               res.render("secrets");
          });
     });    
});
app.post("/login",function(req,res){
     var username= req.body.username;
     var password=req.body.password;
     User.findOne({email:username},function(err,found){
          if(err) throw err;
          if(found)
          {
               bcrypt.compare(password,found.password,function(err,pass){
                    res.render("secrets");
               });
          }
                    
               
               else{
                    res.send("Register yourself");
               }
          })
     });
     
app.listen(167);