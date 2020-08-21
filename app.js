const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const passport = require("passport");
const mongoose = require("mongoose");
const session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: "secret 123",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/ssAPP", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

const userSchema = new mongoose.Schema({
    username: {
        type: String
    },
    password: {
        type: String
    }
})

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("ssAPPuserDb", userSchema);
passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) =>{
    res.render("login")
})





app.post("/", (req, res) =>{
   const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, (err, user) =>{
        if(err){
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req, res, () =>{
                res.redirect("/dashboard")
            })
        };
    })
})

app.get("/register", (req, res) =>{
    res.render("register")
})

app.get("/dashboard", (req, res) =>{
 if(req.isAuthenticated()){
     res.render("dashboard", {user: req.user.username})
 } else {
     res.redirect("/");
 }
})
app.post("/register", (req, res) =>{
    User.register({username: req.body.username}, req.body.password, (err, user) =>{
          if(err) {
              res.redirect("/register")
          } else {
              passport.authenticate("local")(req, res, () => {
                  res.redirect("/dashboard")
              })
          }

        })
})


app.post("/logout", (req, res) =>{
    req.logout();
    res.redirect("/");
})
app.listen(3000)