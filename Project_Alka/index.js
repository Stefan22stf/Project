const express = require("express");
const app = express();
const mysql2 = require("mysql2");
const bcrypt = require("bcrypt");
const path = require("path");
const handlebars = require("express-handlebars");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const hashSK = bcrypt.hashSync("ALKA",10);
const schedule = require('node-schedule');
const mqtt = require('mqtt');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 


const db = mysql2.createConnection({
  host: 'localhost',
  user: 'myuser',
  password: 'mypass',
  database:'alkadb'
});

function insertRow(day, time, data) {
  const query = 'INSERT INTO conveyor_run (day, time, data) VALUES (?, ?, ?)';
  db.query(query, [day, time, data], (err, results) => {
    if (err) {
      console.error('Eroare la inserare:', err);
    } else {
      console.log('Rândul a fost inserat cu succes!');
    }
  });
}

function updateRow(day, time) {
  const query = 'UPDATE conveyor_run SET time = time + ? WHERE day = ?';
  db.query(query, [time, day], (err, results) => {
    if (err) {
      console.error('Eroare la actualizare:', err);
    } else {
      console.log('Rândul a fost actualizat cu succes!');
    }
  });
}

const client = mqtt.connect('mqtt://192.168.0.152');

client.on('connect', () => {
  console.log('Conectat la broker MQTT');
});

client.subscribe('/conveyor/state/run', (err) => {
  if (!err) {
    console.log('Abonat la topic');
  }
});


client.on('message', (topic, message) => {
  console.log(`Mesaj primit pe topic ${topic}: ${message.toString()}`);
  if (message.toString() === "1") {
  
    const daysOfWeek = ["Duminica", "Luni", "Marti", "Miercuri", "Joi", "Vineri", "Sambata"];
    const date = new Date();
    const day = daysOfWeek[date.getDay()];
    const time = 5; 
    const data = new Date(); 

    const checkQuery = 'SELECT * FROM conveyor_run WHERE day = ?';
    db.query(checkQuery, [day], (err, results) => {
      if (err) {
        console.error('Eroare la verificare:', err);
      } else if (results.length === 0) {
        insertRow(day, time, data);
      } else {
        updateRow(day, time);
      }
    });
  }
});


const task = schedule.scheduleJob('0 0 1 * *', async () => {
  try {
    await db.query('TRUNCATE TABLE error_logs');
    console.log('Truncated data from error_logs table');
  } catch (error) {
    console.error('Error truncating data:', error);
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
}

app.get('/', (req,res) => {
  res.clearCookie("temporary");
  res.render('layouts/index');
});

app.get("/register",(req, res)=>{
  res.render("layouts/register",{err:false,error:false})
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
})

app.get('/dashboard', isAuthenticated, (req, res) => {
  res.redirect('/dashboard');
});

app.get('/reports', (req, res) => {
  const countErrorsQuery = `
    SELECT DAYNAME(error_date) AS dayOfWeek, COUNT(*) AS errorCount
    FROM error_logs
    GROUP BY dayOfWeek
  `;
  const conveyorRunQuery = 'SELECT day, time FROM conveyor_run';

  Promise.all([
    new Promise((resolve, reject) => {
      db.query(countErrorsQuery, (err, errorResults) => {
        if (err) {
          reject(err);
        } else {
          resolve(errorResults);
        }
      });
    }),
    new Promise((resolve, reject) => {
      db.query(conveyorRunQuery, (err, conveyorResults) => {
        if (err) {
          reject(err);
        } else {
          resolve(conveyorResults);
        }
      });
    })
  ])
    .then(([errorData, conveyorData]) => {

      res.render('layouts/reports', {
        errorData: JSON.stringify(errorData),
        conveyorData: JSON.stringify(conveyorData)
      });
    })
    .catch((err) => {
      console.error('Eroare la interogări:', err);
      res.status(500).send('Eroare la obținerea datelor din baza de date');
    });
});

app.get('/setting', (req, res) => {
  res.render("layouts/setting"); 
});


app.get('/contact', (req, res) => {
  res.render("layouts/contact"); 
});

app.get('/documentatie', (req, res) => {
  res.render("layouts/documentatie"); 
});

 app.get("/logout", (req, res) => {
  res.clearCookie("email"); 
  res.clearCookie("login"); 
  res.redirect("/"); 
});

app.get('/errors', (req, res) => {
  if (req.cookies["login"]=='true' || req.cookies["temporary"]=="true") {
    const query = 'SELECT * FROM error_logs ORDER BY id DESC';
    db.query(query,[], (err, result) => {
      if (err) throw err;
      console.log(result);
      res.render('layouts/errors', { error_logs: result });
    });
  }else{
    res.redirect("/");
  }
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
      var insertQuery = "INSERT INTO users(email, password) VALUES (?, ?)";
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
      const storedHash = result[0]["password"];
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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


app.listen(3000, () => {
    console.log ("Server Connected!")
});