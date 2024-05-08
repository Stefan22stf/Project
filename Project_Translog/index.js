const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const app = express();
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const cors = require('cors');
app.use(cors({
  origin: ['http://10.245.14.20:6500', 'http://192.168.1.11:6500'] // Replace with the appropriate origin
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
const saltRounds = 10;
const handlebars = require("express-handlebars");
const { query } = require("express");
const e = require("connect-flash");
const hashSK = bcrypt.hashSync("translogConveyor",10);

app.set("view engine", "handlebars");

app.use(
  cookieParser({
    name: "session",
    secret: ["727d4f9b66d4e018399cfa02e6d00f44"],
    maxAge: 7 * 24 * 60 * 60 * 1000, // 24 hours
  })
);
app.use(flash());

  const con = mysql.createConnection({
    host: "localhost",
    user: "myuser",
    password: "mypass",
    database: "translog",
    timezone : 'Z'
  });
  
  con.connect(function (err) {
    if (err) throw err;
    console.log("Successfull connected to DB!");
  });

  const port = 6500;

var hbs = handlebars.create({
  helpers: {
    sayHello: function () {
      alert("Hello World");
    },
    // Register custom substring helper
    substring: function (string, start, end) {
      var x = string.toISOString();

      return x.substring(start, end);
    },
    getStringifiedJson: function (value) {
      return JSON.stringify(value);
    },
    range: function(start, end, options) {
      var result = '';
      for (var i = start; i <= end; i++) {
        result += options.fn({id: i
        });
      }
      return result;
    },
    log : function(x){
      console.log(x);
    },
    rchr: function(str) {
      if (str.length > 10)
        return str.substring(str.length-9,str.length);
      return str;
    },
    rsts: function(str) {
      if (str==0){
        return "In progress";
      }else{
        return "Delivered";
      }
        
    },
    efficient: function(nr1, nr2) {
      if(nr2==0){
        return 100;
      }else{
      return Math.round(((nr2/nr1)*100)*100)/100;
      }
        
    }
  },
  defaultLayout: null,
  layoutsDir: ["views/layouts/"],
  partialsDir: ["views/partials/"],
  extname: "hbs",
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  var cookies = req.cookies;
  if (cookies["TranslogLogin"] == "true") {
    console.log("Already logged in!");
    res.redirect("/dashboard");
  } else {
    console.log("First time here!");
  }
  console.log(cookies);
  res.render("layouts/index");
});

app.get("/register",(req, res)=>{
  res.render("layouts/register",{err:false,error:false})
});

app.get("/readReport",(req,res)=>{
  var cookies = req.cookies;
  var query = "";

  if(cookies["TranslogLogin"] == "true"){

    var r = [0,0];  
    //var q = "select sum(barcode like \"%?\") e, sum(barcode like \"%MOD%\") r from readings where date>=curdate();";
    var q = "SELECT 'tbcd'AS `time_period`,COUNT(*)AS `barcode_count`FROM `readings`WHERE DATE(`date`)=CURDATE() UNION ALL SELECT 'terror'AS `time_period`,COUNT(*)AS `barcode_count`FROM `readings`WHERE DATE(`date`)=CURDATE()AND (barcode like '%????%' or length(barcode)>9) UNION ALL SELECT 'wbarcode'AS `time_period`,COUNT(*)AS `barcode_count`FROM `readings`WHERE DATE(`date`)>=CURDATE()-INTERVAL 1 WEEK AND DATE(`date`)<=CURDATE() UNION ALL SELECT 'werror'AS `time_period`,COUNT(*)AS `barcode_count`FROM `readings`WHERE DATE(`date`)>=CURDATE()-INTERVAL 1 WEEK AND DATE(`date`)<=CURDATE()AND (barcode like '%????%' or length(barcode)>9) UNION ALL SELECT 'mbarcode'AS `time_period`,COUNT(*)AS `barcode_count`FROM `readings`WHERE DATE(`date`)>=CURDATE()-INTERVAL 1 MONTH AND DATE(`date`)<=CURDATE()-INTERVAL 1 WEEK UNION ALL SELECT 'merror'AS `time_period`,COUNT(*)AS `barcode_count`FROM `readings`WHERE DATE(`date`)>=CURDATE()-INTERVAL 1 MONTH AND DATE(`date`)<=CURDATE() AND (barcode like '%????%' or length(barcode)>9);"
    con.query(q, function(err, result){
      if(err) throw err;
      console.log(result);
      res.render("layouts/readsReport", {result:result});
    });

    

 

   

  }else{
    res.redirect("/");
  }
});

app.get('/errors',(req,res)=>{
  var cookies = req.cookies;
  var query = "";

  if(cookies["TranslogLogin"] == "true"){
    var obj;
    
    query = "select id,type,description,location,status,data, TIMESTAMPDIFF(MINUTE, data, now()) AS durata from errors where status = 0 order by type";
    con.query(query,function(err,result){
      if (err) throw err;
      console.log(result);
      res.render("layouts/errors", {result:result});
    });
  }else{
    res.redirect("/");
  }
});

app.get("/single",(req,res)=>{
  var query = "update comenzidivertari set status=0";
  con.query(query, function(err, result){
    if(err) throw err;
  })
  var query = "update comenzidivertari set destination=\"01\"";
  con.query(query, function(err, result){
    if(err) throw err;
  })
  res.redirect("/dashboard");
});

app.get("/multi",(req,res)=>{
    var query = "delete from comenzidivertari";
    con.query(query,function(err,result){
      if(err) throw err;
    })
    var destination = 2;
    var barcode = "";
    for(var i=1; i<10000; i++){
        if (i < 10){
          barcode = "MOD00000"
        }
        else if (i > 9 && i<100){
          barcode = "MOD0000"
      }
      else if (i>99 && i<1000){
          barcode = "MOD000"
      }
      else if (i>999){
          barcode = "MOD00"
      }
      barcode = "000000000000000000000" + barcode + String(i)

      var query = "insert into comenzidivertari(sender,receiver,comPoint,seqNb,msgType,barcode,destination,error,status) values (\"L1\",\"S1\",\"CP01\",\"000000000034\",\"SDIR\",\""+barcode+"\",\"0"+String(destination)+"\",\"00\",0)";
      console.log(query);
      con.query(query,function(err, result){
        if (err) throw err;
      })

      destination++;

      if(destination>8){
        destination = 2;
      }

    }
    res.redirect("/dashboard");
});

app.get("/alltotes", (req,res)=>{
  try{
    var query = "select count(barcode) as totes from notificari where barcode not like '%????%' and barcode!='status' and timestamp>CURDATE()";
    con.execute(query,function(err,result){
      if(err) throw err;
      res.status(200).send(result[0]);
    })
  }
  catch(error){
    console.log(error);
    res.status(500).send("Database Error");
  }
});

app.get("/workingHour", (req,res)=>{
  try{
    var query = "select count(wh) as 'wh' from register where data>CURDATE()"
    con.execute(query,function(err,result){
      if(err) throw err;
      res.status(200).send(result[0]);
    })
  }
  catch(error){
    console.log(error);
    res.status(500).send("Database Error");
  }
});


app.get("/totesdest", (req,res)=>{
  try{
    var query = "select count(barcode) as 'nr', targetDump as 'destination' from notificari where barcode not like '%????%' and barcode != 'status' and timestamp>CURDATE() group by targetDump;"
    con.execute(query,function(err,result){
      if(err) throw err;
      res.status(200).send(result);
    })
  }
  catch(error){
    console.log(error);
    res.status(500).send("Database Error");
  }
});

app.get("/getSingle",(req,res)=>{

  var cookies = req.cookies;
  var query = "";

  if(cookies["TranslogLogin"] == "true"){
    var obj;
    console.log("request signle: " + req.query);

    var query = "select * from comenzidivertari where barcode like \"%"+ req.query.barcode +"\" order by id desc";
    con.query(query, function(err,result){
      if(err) throw err;
      res.render("layouts/commands", {result:result})
    });
  }else{
    res.redirect("/");
  }
});

app.get("/getSingleDone",(req,res)=>{

  var cookies = req.cookies;
  var query = "";

  if(cookies["TranslogLogin"] == "true"){
    var obj;
    console.log("request signle: " + req.query);

    var query = "select * from notificari where barcode like \"%"+ req.query.barcode +"\" order by id desc";
    console.log(query);
    con.query(query, function(err,result){
      if(err) throw err;
      res.render("layouts/done", {result:result})
    });
  }else{
    res.redirect("/");
  }
});

app.get("/ackErrors",(req,res)=>{
  var cookies = req.cookies;
  var query = "";

  if(cookies["TranslogLogin"] == "true"){
    var obj;
    
    query = "update errors set status = 1";
    con.query(query,function(err,result){
      if (err) throw err;
      console.log(result);
      res.redirect("/errors");
    });
  }else{
    res.redirect("/");
  }
});

app.get("/reads",(req,res)=>{
  var cookies = req.cookies;
  var query = "";

  if(cookies["TranslogLogin"] == "true"){
    var obj;

    console.log(req.query);

    if(req.query==""){
      obj = { start: "", end:""};
    }
    else{
      obj = { start: String(req.query.start).replace('T', ' '), end:String(req.query.end).replace('T', ' ')};
    }

    console.log(obj);
    console.log(obj["start"].length)
    console.log(obj["end"].length==0)

    if(obj["start"].length >9 && obj["end"].length >9){
      query = "select * from divertari where date>\""+ obj["start"] +"\" and date<\""+ obj["end"] +"\" order by id desc";
    }else if(obj["start"].length>9 && obj["end"].length<9){
      query = "select * from divertari where date>\""+ obj["start"] + "\" order by id desc";
    }else if(obj["start"].length<9 && obj["end"].length>9){
      query = "select * from divertari where date<\""+ obj["end"] +"\" order by id desc";
    }else{
      query = "select * from divertari order by id desc limit 100";
    }
    console.log(query);
    con.query(query, function(err, result){
      if(err) throw err;
      //console.log(result[0]);
      res.render("layouts/reads", {result:result})
  });

  }else{
    res.redirect("/");
  }
})

app.get("/done",(req,res)=>{
  var cookies = req.cookies;
  var query = "";

  if(cookies["TranslogLogin"] == "true"){
    var obj = { start: "", end:""};

    console.log(req.query);

    console.log(Object.keys(req.query).length === 0);

    if(Object.keys(req.query).length === 0){
      obj = { start: "", end:""};
    }
    else{
      if(req.query.start !== '' && req.query.end !== ''){
        obj = { start: req.query.start.toString().replace('T', ' '), end:req.query.end.toString().replace('T', ' ')};
      }else{
        if(req.query.start !== '' && req.query.end === '' ){
          obj = { start: req.query.start.toString().replace('T', ' '), end:''};
        }else{
          obj = { start: '', end:req.query.end.toString().replace('T', ' ')};
        }
      } 
    }

    if(obj["start"] != '' && obj["end"]!=''){
      query = "select * from notificari where timestamp>\""+ obj["start"] +":00\" and timestamp<\""+ obj["end"] +":00\" and barcode!=\"status\" order by id desc";
    }else if(obj["start"] != '' && obj["end"]==''){
      query = "select * from notificari where timestamp>\""+ obj["start"] + ":00\" and barcode!=\"status\" order by id desc";
    }else if(obj["start"] == '' && obj["end"]!=''){
      query = "select * from notificari where timestamp<\""+ obj["end"] +":00\" and barcode!=\"status\"order by id desc";
    }else{
      query = "select * from notificari where barcode!=\"status\" order by id desc limit 20";
    }
    console.log(query);
    con.query(query, function(err, result){
      if(err) throw err;
      //console.log(result[0]);
      res.render("layouts/done", {result:result})
  });
  }else{
    res.redirect("/");
  }
});

app.get("/commands",(req,res)=>{
  var cookies = req.cookies;
  var query = "";

  if(cookies["TranslogLogin"] == "true"){
    var obj = { start: "", end:""};

    if(Object.keys(req.query).length === 0){
      obj = { start: "", end:""};
    }
    else{
      if(req.query.start !== '' && req.query.end !== ''){
        obj = { start: req.query.start.toString().replace('T', ' '), end:req.query.end.toString().replace('T', ' ')};
      }else{
        if(req.query.start !== '' && req.query.end === '' ){
          obj = { start: req.query.start.toString().replace('T', ' '), end:''};
        }else{
          obj = { start: '', end:req.query.end.toString().replace('T', ' ')};
        }
      } 
    }

    if(obj["start"] != '' && obj["end"]!=''){
      query = "select * from comenzidivertari where timestamp>\""+ obj["start"] +"\" and timestamp<\""+ obj["end"] +"\" order by id desc";
    }else if(obj["start"] != '' && obj["end"]==''){
      query = "select * from comenzidivertari where timestamp>\""+ obj["start"] + "\" order by id desc";
    }else if(obj["start"] == '' && obj["end"]!=''){
      query = "select * from comenzidivertari where timestamp<\""+ obj["end"] +"\" order by id desc";
    }else{
      query = "select * from comenzidivertari order by id desc limit 20";
    }
    console.log(query);
    con.query(query, function(err, result){
      if(err) throw err;
      //console.log(result[0]);
      res.render("layouts/commands", {result:result})
  });
  }else{
    res.redirect("/");
  }
});

app.get("/done",(req,res)=>{
  var cookies = req.cookies;
  var query = "";

  if(cookies["TranslogLogin"] == "true"){
    var obj;

    console.log(req.query);

    if(req.query!=""){
      obj = { start: "", end:""};
    }
    else{
      obj = { start: req.query.start.toString().replace('T', ' '), end:req.query.end.toString().replace('T', ' ')};
    }
   

    if(obj["start"] != '' && obj["end"]!=''){
      query = "select * from notificari where timestamp>\""+ obj["start"] +"\" and timestamp<\""+ obj["end"] +"\" and barcode!=\"status\" order by id desc";
    }else if(obj["start"] != '' && obj["end"]==''){
      query = "select * from notificari where timestamp>\""+ obj["start"] + "\" and barcode!=\"status\" order by id desc";
    }else if(obj["start"] == '' && obj["end"]!=''){
      query = "select * from notificari where timestamp<\""+ obj["end"] +"\" and barcode!=\"status\" order by id desc";
    }else{
      query = "select * from notificari where barcode!=\"status\" order by id desc limit 20";
    }
    console.log(query);
    con.query(query, function(err, result){
      if(err) throw err;
      //console.log(result[0]);
      res.render("layouts/done", {result:result})
  });
  }else{
    res.redirect("/");
  }
});

app.post("/register",(req, res)=>{
  const obj = JSON.parse(JSON.stringify(req.body)); // req.body = [Object: null prototype] { title: 'product' }

  console.log(obj);  
    
  const user = obj["email"];
  const pass = obj["psw"];
  var sk = String(obj["secret"]);

  console.log(user + " " + pass + " " + sk.toString());

  var q = "insert into users(username,password) values (?, ?);"
  var ress = bcrypt.compareSync(sk,String(hashSK));
  console.log(sk + " " + String(hashSK));
  console.log(ress);
  if(ress == true){
    con.query(q,[user,String(bcrypt.hashSync(String(pass),10))], function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
      res.render("layouts/register", {error:false,err:true});
    });
  }else{
    res.render("layouts/register",{error:true,err:true});
  }
});

app.post("/login", (req, res) => {

  const obj = JSON.parse(JSON.stringify(req.body)); // req.body = [Object: null prototype] { title: 'product' }

  console.log(obj);  
    
  const user = obj["email"]
  const pass = obj["psw"]
  const rmb = req.body.remember;

  console.log(user + " " + pass);

  const hash = bcrypt.hashSync(pass,saltRounds);

  var q = "select * from users where username = \"" + [user] +"\"";

  con.query(q,
    function (err, result, fields) {
      if (err) throw err;
      if (result.length > 0) {
        var rst = generateHash(result[0]["email"], pass, result[0]["password"], res);
      } else {
        console.log("Wrong user!");
        res.redirect("/?error=wrong");
      }
    }
  );
});

app.get("/logout", (req, res) => {
    res.clearCookie("TranslogLogin");
    res.redirect("/");
  });

app.get("/dashboard",(req,res)=>{
  var cookies = req.cookies;
  var query = "";

  if(cookies["TranslogLogin"] == "true"){
    res.render("layouts/dashboard");
  }else{
    res.redirect("/");
  }
});

async function generateHash(email, pass, pass1, res) {
    const hash = await bcrypt.hash(pass,saltRounds);
    console.log(hash);
    const rest = await bcrypt.compare(pass,pass1);
    
    if (rest) {
      console.log("Success Login!");
      res.cookie('TranslogLogin','true');
      res.redirect('/dashboard');
    } else {
      console.log("Wrong Password");
      res.redirect("/");
    }
  }



app.listen(port, "0.0.0.0", () => console.log(`App listening to port ${port}`));
