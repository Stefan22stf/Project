const express = require("express");
const app = express();
const mysql2 = require("mysql2");
const mysql = require('mysql2/promise');
const bcrypt = require("bcrypt");
const path = require("path");
const handlebars = require("express-handlebars");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const hashSK = bcrypt.hashSync("FANCOURIER",10);
const schedule = require('node-schedule');
const mqtt = require('mqtt');
const nodemailer = require('nodemailer');
const fs = require('fs');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 


const db = mysql2.createConnection({
  host: 'localhost',
  user: 'myuser',
  password: 'mypass',
  database:'fanCourier'
});

const client = mqtt.connect('mqtt://192.168.0.132');

client.on('connect', () => {
  console.log('Conectat la broker MQTT');
  client.subscribe('/conveyor/objectToSend');
  client.subscribe('/conveyor/destination');
  client.subscribe('/diverter/flowsort/eroare/#');
});

client.on('message', async (topic, message) => {
  try {

    if (topic === '/conveyor/objectToSend') {
      const [idClient, barcode, dimensions, doneWms] = message.toString().split('|').map(part => part.trim());
      const insertQuery = 'INSERT INTO conveyor_data (id_client, barcode, length, width, height, weight, date, done_wms) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)';
      const [length, width, height, weight] = dimensions.split('x').map(part => part.trim());
      await db.execute(insertQuery, [idClient, barcode, length, width, height, weight, doneWms]);
      // console.log('Datele au fost inserate în baza de date.');
    }

    if (topic === '/conveyor/destination') {
      const [id_client, barcode, destinatie] = message.toString().split('|').map(part => part.trim());
      const insertQuery = 'INSERT INTO destination (id_client, barcode, destinatie, date) VALUES (?, ?, ?, NOW())';
      await db.execute(insertQuery, [id_client, barcode, destinatie]);
      // console.log('S-au inserat destinatiile.');
    }


    if (topic.startsWith('/diverter/flowsort/eroare')) {
      diverter = topic.split('/');

      const insertErrorQuery = 'INSERT INTO error_logs (type, description, status, error_date) VALUES (?, ?, 1, NOW())';
      console.log(insertErrorQuery);
      db.query(insertErrorQuery, ['Eroare', "Diverter " + diverter[4] + " - " + message.toString(), diverter[4]], (err, res) => {
        if (err) throw err
      });

      console.log('Mesaj de eroare inserat în baza de date:', message.toString());
    }
  } catch (error) {
    console.error('Eroare la prelucrarea mesajului:', error);
  }
});

db.connect(function(err) {
  if (err) throw err;
  console.log('Database is connected successfully !');
});
module.exports = db;
  
  
app.set("view engine", "handlebars");

const publicDirectory = path.join(__dirname, './public');

console.log(__dirname)
app.use(express.static(publicDirectory));
app.use(
  cookieParser({
  name: "dasstecDashboard",
  secret: ["727d4f9b66d4e018399cfa02e6d00f44"],
  maxAge: 7 * 24 * 60 * 60 * 1000, 
  })
);


var hbs = handlebars.create({
  helpers: {
    sayHello: function () {
    alert("Hello World");
    },
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
    stats: function(str){
    if(str==1){
        return "Active"
    }else{
        return "Inactive"
    }
    },
    rsts: function(str) {
    if (str==0){
        return "In progress";
    }else{
        return "Delivered";
    }
        
    },
    calculateDuration : function(datetime, status, duration){
    if(status==1){
        console.log(new Date(datetime))
        return Math.round(Math.abs(Date.now() - new Date(datetime))/1000/60);
    }else{
        return duration;
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

function isAuthenticated(req, res) {
  if (req.cookies["login"]=='true' || req.cookies["temporary"]=="true") {
    res.render("layouts/dashboard"); 
  } else {
    res.redirect("/"); 
  }
};

app.get('/dashboard', isAuthenticated, (req, res) => {
  res.redirect('/dashboard');
});

app.get('/', (req,res) => {
  res.clearCookie("temporary");
  res.render('layouts/index');
});

app.get("/register",(req, res)=>{
  res.render("layouts/register",{err:false,error:false})
});

app.post("/register", (req, res) => {
  const obj = req.body;
  console.log(obj);

  const email = obj.email;
  const pass = obj.psw;
  var sk = obj.secret;

  console.log(email + " " + pass + " " + sk.toString());
  var selectQuery = "SELECT COUNT(*) AS count FROM users WHERE email = ?";
  db.query(selectQuery, [email], function (err, result) {
    if (err) throw err;
    const count = result[0].count;

    if (count > 0) {
      res.render("layouts/register", { error: true, err: true });
      console.log("Utilizator existent");
    } else {
      var insertQuery = "INSERT INTO users(email, parola) VALUES (?, ?)";
      db.query(insertQuery, [email, bcrypt.hashSync(pass, 10)], function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
        res.render("layouts/register", { error: false, err: true });
      });
    }
  });
});
  
app.post("/index", (req, res) => {
  const obj = req.body; 

  const email = obj["email"];
  const pass = obj["psw"];
  const rememberMe = obj["rmb"];
  

  console.log(email + " " + pass);

  const q = "SELECT * FROM users WHERE email = ?";
  db.query(q, [email], function (err, result) {
    if (err) throw err;
    if (result.length > 0) {
      res.cookie("temporary","true");
      const storedHash = result[0]["parola"];
      const match = bcrypt.compareSync(pass, storedHash);
      if (match) {
        if (rememberMe) {
          console.log("A bifat casuta");
          res.cookie("login", 'true'); 
        }
        res.redirect("/dashboard"); 
      } else {
        console.log("Wrong password!");
        res.redirect("/");
      }
    } else {
      console.log("Wrong user!");
      res.redirect("/"); 
    }
  });
});

app.get('/destination', (req, res) => {
  if (req.cookies["login"] == 'true' || req.cookies["temporary"] == "true") {
      const query = 'SELECT * FROM destination ORDER BY id DESC';
      db.query(query, [], (err, result) => {
          if (err) throw err;
          // console.log(result); 
          res.render('layouts/destination', { destination: result });
      });
  } else {
      res.redirect("/");
  }
});

app.get('/errors', (req, res) => {
  if (req.cookies["login"]=='true' || req.cookies["temporary"]=="true") {
    const query = 'SELECT * FROM error_logs ORDER BY id DESC';
    db.query(query,[], (err, result) => {
      if (err) throw err;
      // console.log(result);
      res.render('layouts/errors', { error_logs: result });
    });
  }else{
    res.redirect("/");
  }
});

app.get('/checkErrors',(req,res)=>{
  try{
    var query = "select * from error_logs where status=1"
    db.query(query, (err,result)=>{
        res.status(200).send({error:result.length});
    });
  }catch(e){
    console.log(e);
  }
});

app.post("/update-status/:id", (req, res) => {
  const id = req.params.id;

  const updateQuery1 = "UPDATE error_logs SET duration = TIMESTAMPDIFF(SECOND, error_date, NOW()) where status = 1;";
  db.query(updateQuery1, (err, result) => {
    if (err) {
        console.error("A apărut o eroare la actualizare:", err);
        res.status(500).json({ error: "A apărut o eroare la actualizare" });
    } else {
        console.log("Status actualizat cu succes!");
        res.status(200).render("layouts/errors",{ message: "Status actualizat cu succes" });
    }
  });

  const updateQuery = "UPDATE error_logs SET status = 0";
  db.query(updateQuery, (err, result) => {
      if (err) {
          console.error("A apărut o eroare la actualizare:", err);
          res.status(500).json({ error: "A apărut o eroare la actualizare" });
      } else {
          console.log("Status actualizat cu succes!");
          res.status(200).render("layouts/errors",{ message: "Status actualizat cu succes" });
      }
  });
});

app.get('/reports', (req, res) => {
  if (req.cookies["login"]=='true' || req.cookies["temporary"]=="true") {
    res.render('layouts/reports');
  }else{
    res.redirect("/");
  }
});

app.get('/contact' ,(req, res) => {
  if( req.cookies["login"] == 'true' || req.cookies["temporary"]=="true"){
    res.render("layouts/contact")
  }else{
    res.redirect("/")
  }
});

app.get('/documentatie', (req, res) => {
  if(req.cookies["login"] =='true' || req.cookies["temporary"]=="true"){
    res.render("layouts/documentatie")
  }else{
    res.redirect('/')
  }
});

app.get('/lastRead', async (req, res) => {
  if(req.cookies["login"] =='true' || req.cookies["temporary"]=="true"){
    try {
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'myuser',
        password: 'mypass',
        database: 'fanCourier'
      });
  
      const [rows, fields] = await connection.execute('SELECT * FROM conveyor_data ORDER BY id DESC');
  
      await connection.end();
  
      res.render('layouts/lastRead', { errors: rows });
    } catch (error) {
      console.error('Eroare la interogarea bazei de date:', error);
      res.status(500).send('Eroare la afișarea datelor');
    }
  }else{
    res.redirect('/')
  }
});

// Funcția de trimitere email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'fancouriersorter@gmail.com', // Adresa de email de la care veți trimite
    pass: 'fioa bjzu rqzu qdnn' // Parola pentru adresa de email de la care veți trimite
  }
});

// Email pentru parcelDestination
app.get('/send-emailDestination', (req, res) => {
  try {
      const emailAddress = ['stefan.mihalcea@dasstec.ro', 'laurentiu.staicu@dasstec.ro'];
      
      // Colectăm data și ora curentă
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); 
      const day = currentDate.getDate().toString().padStart(2, '0'); 
      const hours = currentDate.getHours().toString().padStart(2, '0'); 
      const minutes = currentDate.getMinutes().toString().padStart(2, '0'); 

      const fileName = `${year}-${month}-${day}_${hours}-${minutes}.xlsx`;

      const mailOptions = {
          from: 'fancouriersorter@gmail.com', 
          to: emailAddress,
          subject: 'Destinatii Sorter',
          text: 'Acesta este un email automat generat.',
          attachments: [{
              filename: fileName, 
              path: path.join('/home/stefan/Downloads', fileName) 
          }]
      };

      transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
              console.error('Eroare la trimiterea emailului:', error);
              res.status(500).send('Eroare la trimiterea emailului');
          } else {
              console.log('Email trimis cu succes:', info.response);
              res.status(200).send('Email trimis cu succes');
          }
      });
  } catch (error) {
      console.error('Eroare la procesarea cererii de trimite email:', error);
      res.status(500).send('Eroare la procesarea cererii de trimite email');
  }
});

//Email pentru lastRead
app.get('/send-email', (req, res) => {
  try {
      const emailAddress = ['stefan.mihalcea@dasstec.ro', 'laurentiu.staicu@dasstec.ro'];
      
      // Colectăm data și ora curentă
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); 
      const day = currentDate.getDate().toString().padStart(2, '0'); 
      const hours = currentDate.getHours().toString().padStart(2, '0'); 
      const minutes = currentDate.getMinutes().toString().padStart(2, '0'); 

      const fileName = `${year}-${month}-${day}_${hours}-${minutes}.xlsx`;

      const mailOptions = {
          from: 'fancouriersorter@gmail.com', 
          to: emailAddress,
          subject: 'Date Sorter',
          text: 'Acesta este un email automat generat.',
          attachments: [{
              filename: fileName, 
              path: path.join('/home/stefan/Downloads', fileName) 
          }]
      };

      transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
              console.error('Eroare la trimiterea emailului:', error);
              res.status(500).send('Eroare la trimiterea emailului');
          } else {
              console.log('Email trimis cu succes:', info.response);
              res.status(200).send('Email trimis cu succes');
          }
      });
  } catch (error) {
      console.error('Eroare la procesarea cererii de trimite email:', error);
      res.status(500).send('Eroare la procesarea cererii de trimite email');
  }
});

// Functia de cautare dupa cod de bare la destinatii
app.get('/searchDestinations', async (req, res) => {
  const barcode = req.query.barcode;
  try {
      const connection = await mysql.createConnection({
          host: 'localhost',
          user: 'myuser',
          password: 'mypass',
          database: 'fanCourier'
      });

      const [rows] = await connection.execute('SELECT * FROM destination WHERE barcode = ?', [barcode]);
      await connection.end();

      if (rows.length > 0) {
          res.json({ success: true, data: rows });
      } else {
          res.json({ success: false, messageBarcode: 'Nu s-au găsit date pentru codul de bare specificat.' });
      }
  } catch (error) {
      console.error('Eroare la interogarea bazei de date:', error);
      res.status(500).json({ success: false, message: 'Eroare la căutarea datelor' });
  }
});

// Functia de cautare dupa data si ora la destinatii
app.get('/searchDestinationsDate', async (req, res) => {
  if (req.cookies["login"] == 'true' || req.cookies["temporary"] == "true") {
      try {
          const date = req.query.date || null;
          const timeStart = req.query.timeIntrare || '00:00';
          const timeEnd = req.query.timeExit || '23:59';

          if (!date) {
              return res.status(400).json({ success: false, message: 'Data trebuie să fie specificată.' });
          }

          const dateTimeStart = `${date} ${timeStart}:00`;
          const dateTimeEnd = `${date} ${timeEnd}:00`;

          const connection = await mysql.createConnection({
              host: 'localhost',
              user: 'myuser',
              password: 'mypass',
              database: 'fanCourier'
          });

          const query = `
              SELECT * FROM destination 
              WHERE date BETWEEN ? AND ? 
              ORDER BY id DESC
          `;
          const [rows] = await connection.execute(query, [dateTimeStart, dateTimeEnd]);

          await connection.end();

          if (rows.length > 0) {
              res.json({ success: true, search: rows });
          } else {
              res.json({ success: false, messageSearch: 'Nu s-au găsit date pentru intervalul orar specificat la destinații.' });
          }
      } catch (error) {
          console.error('Eroare la interogarea bazei de date:', error);
          res.status(500).json({ success: false, message: 'Eroare la căutarea datelor la destinații' });
      }
  } else {
      res.redirect('/');
  }
});


// Funcția de căutare după cod de bare
app.get('/searchBarcode', async (req, res) => {
  if (req.cookies["login"] == 'true' || req.cookies["temporary"] == "true") {
    try {
      const barcode = req.query.barcode;

      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'myuser',
        password: 'mypass',
        database: 'fanCourier'
      });

      const [rows, fields] = await connection.execute('SELECT * FROM conveyor_data WHERE barcode = ? ORDER BY id DESC', [barcode]);

      await connection.end();

      if (rows.length > 0) {
        res.json({ success: true, search: rows });
      } else {
        
        res.json({ success: false, messageBarcode: 'Nu s-au găsit date pentru codul de bare specificat.' });
      }
    } catch (error) {
      console.error('Eroare la interogarea bazei de date:', error);
      res.status(500).json({ success: false, message: 'Eroare la căutarea datelor' });
    }
  } else {
    res.redirect('/');
  }
});

// Funcția de căutare după interval de timp
app.get('/search', async (req, res) => {
  if (req.cookies["login"] == 'true' || req.cookies["temporary"] == "true") {
    try {
      const date = req.query.date || null;
      const timeStart = req.query.timeIntrare || '00:00';
      const timeEnd = req.query.timeExit || '23:59';

      if (!date) {
        return res.status(400).json({ success: false, message: 'Data trebuie să fie specificată.' });
      }

      const dateTimeStart = `${date} ${timeStart}:00`;
      const dateTimeEnd = `${date} ${timeEnd}:00`;

      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'myuser',
        password: 'mypass',
        database: 'fanCourier'
      });

      const query = `
        SELECT * FROM conveyor_data 
        WHERE date BETWEEN ? AND ? 
        ORDER BY id DESC
      `;
      const [rows, fields] = await connection.execute(query, [dateTimeStart, dateTimeEnd]);

      await connection.end();

      if (rows.length > 0) {
        res.json({ success: true, search: rows });
      } else {
        res.json({ success: false, messageSearch: 'Nu s-au găsit date pentru intervalul orar specificat.' });
      }
    } catch (error) {
      console.error('Eroare la interogarea bazei de date:', error);
      res.status(500).json({ success: false, message: 'Eroare la căutarea datelor' });
    }
  } else {
    res.redirect('/');
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("email"); 
  res.clearCookie("login"); 
  res.redirect("/"); 
});


app.listen(3000, () => {
  console.log ("Server Connected!")
});
