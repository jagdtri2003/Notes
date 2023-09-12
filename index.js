const express = require("express");
const path = require("path");
const static = path.join(__dirname, "static");
const session = require("express-session");
const app = express();
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("./models/Users");
const Note = require("./models/Notes");

app.use(express.static(static));
app.use(express.json());
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  if (req.session.user) {
    const userData = req.session.user;
    res.render("homepage", { userData });
  } else res.sendFile(auth + "/login.html");
});
app.use(
  session({
    secret: "thisismysecretKeY$$",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 3600000,
    },
  })
);

app.post("/addnote", async (req, res) => {
  if (req.session.user) {
    const userData = req.session.user;
    const { title, content } = req.body;
    // const {title,content} = req.query;
    const email = userData.email;
    const newNote = Note({ title, content, email });
    await newNote.save();
    res.json({ msg: "Success" });
  } else {
    res.json({ msg: "Fail" });
  }
});

app.get("/testform", (req, res) => {
  res.sendFile(static + "/test.html");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    const validPass = await bcrypt.compare(password, user.password);
    if (validPass) {
      req.session.user = {
        name: user.name,
        email: email,
        registered: user.registered,
      };
      res.json({ code: "success" });
    } else {
      res.json({ code: "Fail" });
    }
  } else {
    res.json({ code: "Fail" });
  }
});

app.get("/signout", (req, res) => {
  if (req.session.user) {
    delete req.session["user"];
    res.json({ code: "success" });
  }
});

app.get("/homepage", (req, res) => {
  if (req.session.user) {
    const userData = req.session.user;
    // const userNotes = Note.find({});
    userNotes=[{title:"Hey",content:"Hello Guys!!"}]
    res.render('homepage',{userData,userNotes});
    // res.send(`Welcome, ${userData.name}!`);
  } else {
    res.redirect("/");
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPass = await bcrypt.hash(password, 15);
  let isEmailAlreadyExists = await User.findOne({ email });
  if (isEmailAlreadyExists) {
    res.json({ code: "Fail" });
  } else {
    const userData = new User({ name, email, password: hashedPass });
    await userData.save();
    res.json({ code: "success" });
  }
});

app.get("/*", async (req, res) => {
  res.send("Error 404 : Page Not Found !!");
});

app.listen(5000, () => {
  mongoose.connect("mongodb://127.0.0.1:27017/myUsers").then(() => {
    console.log("Connected to MongoDB");
    console.log("Server is running at port 5000");
  });
});
