const express = require("express");
const path = require("path");
const static = path.join(__dirname, "static");
const session = require("express-session");
const app = express();
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const User = require("./models/Users");
const Note = require("./models/Notes");
require('dotenv').config();
const uuid = require('uuid');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.CRYPT_SECRET_KEY);

const users = {};

app.use(express.static(static));
app.use(express.json());
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("/static"));
const nodemailer = require('nodemailer');

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("Connected to MongoDB");
});

app.use(
  session({
    store: MongoStore.create({
      mongoUrl:process.env.MONGODB_SESSION_URI,
    }),
    secret:process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 259200000
    },
  })
);

  // Create a transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host:'smtp-relay.brevo.com',
    port:587,
    auth: {
      user:'jagdtri2003@gmail.com',  // Your Gmail email address
      pass:'baYqJkcCVL8M9W6j'   // Your Gmail password or app password
    }
  });


app.post("/addnote", async (req, res) => {
  if (req.session.user) {
    const userData = req.session.user;
    const { title, content } = req.body;
    const encryptedContent = cryptr.encrypt(content);
    const time = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const email = userData.email;
    const newNote = Note({ title, content:encryptedContent, email,time });
    await newNote.save();
    res.json({ code: "Success" });
  } else {
    res.json({ code: "Fail" });
  }
});

// For Sharing Notes to other users !!

app.post('/sharenote',async(req,res)=>{

  console.log(req.body);
  const {sharedTo,title,content} = req.body;
    // Email data
    const mailOptions = {
      from: "iNote <noreply@iNote-web.in>",
      to: sharedTo,
      subject: `Note Shared !!`,
      html:`
      <html>
      <head>
        <title>Note Shared</title>
        <style>
        @import url("https://fonts.googleapis.com/css2?family=Berkshire+Swash&display=swap");
        /* Basic styling for the navbar */
        .navbar {
          background-color: rgb(9,32,63); /* Blue background color */
          color: white; /* Text color */
          padding: 10px 20px; /* Padding for content */
          font-family: Arial, sans-serif; /* Font */
          text-align: left; /* Left text */
          border-radius: 4px;
        }
    
        /* Styling for the navbar title */
        .navbar-title {
          font-size: 24px; /* Font size */
          font-weight: bold; /* Bold font */
          font-family: 'Berkshire Swash', cursive;
        }
      </style>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; text-align: center; padding: 20px;">
      
        <!-- Navbar -->
        <div class="navbar">
          <span class="navbar-title">iNote</span>
        </div>

        <div style="background-color: #fff; max-width: 400px; margin: 0 auto; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333;">${req.session.user.name} Shared a Note with You</h2>
          <p style="color: #555;">Click below to view the note:</p>
          <a href="https://inote-web.vercel.app" style="display: inline-block; padding: 10px 20px; margin-top: 20px; text-decoration: none; color: #fff; background-color: rgb(9,32,63); border-radius: 4px;">View Note</a>
        </div>
      
      </body>
      </html>
      `
  };

    const validUser = await User.findOne({email:sharedTo});
        const time = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const sharedBy = req.session.user.name;
        if(validUser){
          const sharedNote = Note({title,content:cryptr.encrypt(content),time:time+" (Shared)",email:sharedTo,sharedBy});
          await sharedNote.save();
          
            // Send email
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  console.log(error);
              } else {
                  console.log(info);
              }
          });
          res.json({msg:`Note Shared to ${sharedTo}`});
        }else{
          res.json({error:"User Not Found !!"});
        }

})

app.put('/editnote/:id',async (req,res)=>{
  const noteId = req.params.id;

  const {title,content} = req.body;
  const encryptedContent = cryptr.encrypt(content);

  try {
    // Use a different variable name for the result
    const updatedNote = await Note.findByIdAndUpdate(noteId, { title, content:encryptedContent });

    if (!updatedNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ code: "Success" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Error updating note" });
  }
})

app.delete("/delete/notes/:id", async (req, res) => {
  const noteId = req.params.id;
  try {
    const deletedNote = await Note.findByIdAndDelete(noteId);

    if (!deletedNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Error deleting note" });
  }
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

app.get("/", async (req, res) => {
  if (req.session.user) {
    const userData = req.session.user;
    let userNotes = await Note.find({ email: userData.email }); 
    userNotes.forEach((note)=>{
      note.content = cryptr.decrypt(note.content);
      // // console.log(cryptr.decrypt(note.content));
      // console.log(note)
    })
    res.render("homepage", { userData ,userNotes});
  } else {
    res.sendFile(static + "/login.html");
  }
});

app.get("/homepage", async (req, res) => {
  if (req.session.user) {
    const userData = req.session.user;
    const userNotes = await Note.find({ email: userData.email });
    userNotes.forEach((note)=>{
      note.content = cryptr.decrypt(note.content);
    })
    res.render("homepage", { userData, userNotes });
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
    const verificationToken = uuid.v4();
    // Store the token associated with the user's email
    users[email] = verificationToken;
    const verificationLink = `http://inote-web.vercel.app/verify?email=${encodeURIComponent(email)}&token=${verificationToken}`;
    const mailOptions = {
      from: 'iNote <noreply@iNote-web.in>', // Sender's email address
      to: email, // Recipient's email address
      subject: 'Welcome to iNote - Simplify Note Taking',
      text: `
      Dear ${name},

      Welcome to iNote, your secure platform for storing notes online! We're thrilled to have you join our community of note-takers and organizers.
      
      At iNote, your privacy and security are our utmost priorities. Our encrypted storage ensures that your notes remain protected and accessible only to you.
      
      To start using iNote and safeguard your notes, please take a moment to verify your email address by clicking the link below:
      
      ${verificationLink}
      
      By verifying your email, you'll gain full access to iNote's suite of features, including encrypted note storage, seamless synchronization, and convenient accessibility from any device.
      
      Thank you for choosing iNote for your note-taking needs. We're excited to assist you in organizing your thoughts securely!
      
      Warm regards,
      Jagdamba Tripathi
      `
    };
    transporter.sendMail(mailOptions,async function(error, info) {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        await userData.save();
        console.log('Email sent:', info.response);
      }});
    res.json({ code: "success" });
  }
});

app.get('/verify', (req, res) => {
  const userEmail = req.query.email;
  const token = req.query.token;

  // Check if the email and token exist in the users store
  if (users[userEmail] && users[userEmail] === token) {
    // Email and token match - Email verified
    res.send('Email verified successfully!');
    // You would typically update the user's status in your database here
  } else {
    // Invalid or expired verification link
    res.send('Invalid verification link!');
  }
});

app.get("/*", async (req, res) => {
  res.send("Error 404 : Page Not Found !!");
});

app.listen(5000, () => {
  console.log("Server is running at port 5000");
});
