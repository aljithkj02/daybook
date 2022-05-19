
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');
const date = require(__dirname+ '/date.js');
const https = require('https');

mongoose.connect('mongodb+srv://admin-aljith:2002@todo.fvnvu.mongodb.net/news',{useNewUrlParser : true});

const postSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  post:{
    type: String,
    required: true
  }
});
const Post = mongoose.model('Post', postSchema);

const homeStartingContent = "Day Book's purpose is to give users to jot down your thoughts and feelings to others , and the main thing is people dont know who wrote this note, You can sync it with multiple devices so you'll be able to capture all ideas in the most relevant way, whether your sitting down at your computer for a long entry or using your Apple Watch when you're on a walk."
const aboutContent = "Day Book is a multifaceted social media company dedicated to helping consumers, business leaders and policy officials make important decisions in their lives."
const contactContent = "Contact me on ";

const app = express();
const day = date.getDate();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



app.get('/', (req, res) => {
  Post.find({},(err,data)=> {
    res.render('home', { hContent: homeStartingContent, posts: data ,date: day})
  })
});

app.get('/about', (req, res) => {
  res.render('about', { aContent: aboutContent });
});

app.get('/contact', (req, res) => {
  res.render('contact', { cContent: contactContent });
});

app.get('/compose', (req, res) => {
  res.render('compose');
});

app.post('/compose', (req, res) => {
  const post = new Post({
    title: req.body.postTitle,
    post: req.body.postBody
  });
  post.save();
  res.redirect('/');
});

app.get('/posts/:topic', (req, res) => {
  let param = _.lowerCase(req.params.topic);

  Post.find({},(err,data)=> {
    data.forEach((post)=> {

      const storedTitles = _.lowerCase(post.title) ;
      if(storedTitles === param){
        res.render('post',{postTitle: post.title , postBody : post.post });
      }
    })
  })

}); 


app.post('/delete',(req,res)=> {
  const title = (req.body.postName).trim();
  Post.deleteOne({title:title},(err,data)=> {
    console.log(data);
  })
  res.redirect('/')
})


app.post('/mail',(req,res)=> {
  const fname = req.body.fname ;
  const lname = req.body.lname ;
  const email = req.body.email ;

  const data = {
      members: [
          {
              email_address: email,
              status: "subscribed",
              merge_fields: {
                  FNAME: fname,
                  LNAME: lname
              }
          }
      ]
  };

  const jsonData = JSON.stringify(data);

const url = "https://us8.api.mailchimp.com/3.0/lists/15be394c62";

const options = {
  method: "post" ,
  auth: "jithu:e246c29beaf9125b4abd688c68a6a81c-us8"
}

const request= https.request(url, options, (response)=> {

  console.log(response.statusCode)
  if(response.statusCode === 200){
      res.render('success');
  }else{
      res.render('failure');
  }

  response.on("data",(data)=> {
      console.log(JSON.parse(data));

  })
});

  request.write(jsonData);
  request.end();
});

app.post('/failure',(req,res)=> {
  res.redirect('/contact');
})





let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server has started Successfully");
});
