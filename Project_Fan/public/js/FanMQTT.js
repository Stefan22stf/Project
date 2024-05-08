function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

let timerScanner = new Date().getTime();

var mqtt = new Paho.MQTT.Client("192.168.0.132", 9001, makeid(10)); 

var buttons = ["StartButton", "StopButton"];

function onConnect() {
  console.log("Connected");
  mqtt.subscribe("/conveyor/state/safety/te1");
  mqtt.subscribe("/conveyor/scanner/status"); 
  try {
      buttons.forEach(element => {
          var doc = document.getElementById(element);
          doc.disabled = false;
      });
  } catch {
      console.error("Error enabling buttons");
  }
}

function mqttConnect() {
  console.log("Connecting to mqtt...");
  var options = {
      timeout: 3,
      onSuccess: onConnect,
  };

  mqtt.connect(options);
  mqtt.onFailure = onFailure;
  mqtt.onConnectionLost = onConnectionLost;
  mqtt.onMessageArrived = onMessageArrived; 
}

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost: " + responseObject.errorMessage);
  }
}

function onFailure(message) {
  console.log("Attempt connection!");
  setTimeout(mqttConnect, 5000); 
}

function startConveyor() {
  var message = new Paho.MQTT.Message("start");
  message.destinationName = "/conveyor/state";
  mqtt.send(message);
}

function stopConveyor() {
  var message = new Paho.MQTT.Message("stop");
  message.destinationName = "/conveyor/state";
  mqtt.send(message);
}

function resetConveyor() {
  
  var message1 = new Paho.MQTT.Message("reset");
  message1.destinationName = "/conveyor/state";
  mqtt.send(message1);

  var message2 = new Paho.MQTT.Message("reset");
  message2.destinationName = "/conveyor/divert";
  mqtt.send(message2);
}

function resetFlowConveyor() {
  var message = new Paho.MQTT.Message("home");
  message.destinationName = "/diverter/flowsort/all";
  mqtt.send(message);
}



function onMessageArrived(message) {
  try{
      var payload = message.payloadString;
      
      if (message.destinationName === "/conveyor/scanner/status") {
        timerScanner = new Date().getTime();
      }
  }
  catch{  
  }   
};

var intervalId = setInterval(function() {
  var element = document.getElementById("scannerStat");
  var elapsedTime = (new Date().getTime() - timerScanner)/1000;
  console.log("Verificare scanner")
  if ( elapsedTime < 10 ) {
      element.innerText = "Online";
  } else {
      element.innerText = "Offline";
  }
}, 1000);

// Adăugăm funcția onMessageArrived pentru gestionarea mesajelor primite
function onMessageArrived(message) {
  var safetyStatus = message.payloadString;
  for (var i = 0; i < safetyStatus.length; i++) {
      var buttonId = "safetyButton" + (i + 1);
      var button = document.getElementById(buttonId);
      if (safetyStatus[i] === "1") {
          button.style.backgroundColor = "green";
      } else if (safetyStatus[i] === "0") {
          button.style.backgroundColor = "red";
      }
  }
}