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
};

var mqtt = new Paho.MQTT.Client("192.168.0.152", 9001, makeid(10));

var buttons = ["StartButton","StopButton","ResetButton"];

function onConnect() {

  console.log("Connected");

  mqtt.subscribe("/conveyor/state/#");

  try{
    buttons.forEach(element => {
        var doc = document.getElementById(element);
        doc.disabled = false;
    });
  }catch{
    ;
  }
  
};

function mqttConnect() {
  console.log("Connecting to mqtt...");
  var options = {
    timeout: 3,
    onSuccess: onConnect,
  };
  
  mqtt.connect(options);
  mqtt.onFailure = onFailure;
  mqtt.onConnectionLost = onConnectionLost;
};

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost: " + responseObject.errorMessage);
  }
};

function onFailure(message) {
  console.log("Attempt connection!");
  setTimeout(mqttConnect, reconnectTimeout);
};

function startConveyor() {
  var message = new Paho.MQTT.Message("start");
  message.destinationName = "/conveyor/state";
  mqtt.send(message);
  disableButtons();
  setTimeout(enableButtons,2000);
};

function stopConveyor() {
  var message = new Paho.MQTT.Message("stop");
  message.destinationName = "/conveyor/state";
  mqtt.send(message);
  disableButtons();
  setTimeout(enableButtons,2000);
};

function resetConveyor() {
  var message = new Paho.MQTT.Message("reset");
  message.destinationName = "/conveyor/state";
  mqtt.send(message);
  disableButtons();
  setTimeout(enableButtons,2000);
  emgLift = false;
};

function startLift1() {
    var message = new Paho.MQTT.Message("startlift1");
    message.destinationName = "/conveyor/state/lift1";
    mqtt.send(message);
};

function stopLift1() {
    var message = new Paho.MQTT.Message("stoplift1");
    message.destinationName = "/conveyor/state/lift1";
    mqtt.send(message);
};

function mentenantaLift1() {
    var message = new Paho.MQTT.Message("mentenantalift1");
    message.destinationName = "/conveyor/state/lift1";
    mqtt.send(message);
};

function Position1L1() {
    var message = new Paho.MQTT.Message("pozitia1");
    message.destinationName = "/conveyor/state/lift1";
    mqtt.send(message);
};

function Position2L1() {
    var message = new Paho.MQTT.Message("pozitia2");
    message.destinationName = "/conveyor/state/lift1";
    mqtt.send(message);
};

function startLift2() {
    var message = new Paho.MQTT.Message("startlift2");
    message.destinationName = "/conveyor/state/lift2";
    mqtt.send(message);
};

function stopLift2() {
    var message = new Paho.MQTT.Message("stoplift2");
    message.destinationName = "/conveyor/state/lift2";
    mqtt.send(message);
};

function mentenantaLift2() {
    var message = new Paho.MQTT.Message("mentenantalift2");
    message.destinationName = "/conveyor/state/lift2";
    mqtt.send(message);
};

function Position1L2() {
    var message = new Paho.MQTT.Message("pozitia1");
    message.destinationName = "/conveyor/state/lift2";
    mqtt.send(message);
};

function Position2L2() {
    var message = new Paho.MQTT.Message("pozitia2");
    message.destinationName = "/conveyor/state/lift2";
    mqtt.send(message);
};

function disableButtons(){
    try{
        buttons.forEach(element => {
            var doc = document.getElementById(element);
            doc.disabled = true;
        });
      }catch{
        ;
      }
}

function enableButtons(){
    try{
        buttons.forEach(element => {
            var doc = document.getElementById(element);
            doc.disabled = false;
        });
      }catch{
        ;
      }
}

function onMessageArrived(message) {
    try{
        var payload = message.payloadString;
        if (message.destinationName === "/conveyor/state/senzori") {
        handleSensorMessage(payload);
        }else if (message.destinationName === "/conveyor/state/motoare") {
        handleMotorMessage(payload);
<<<<<<< HEAD
        
    }
}
=======
        }else if (message.destinationName === "/conveyor/state/lift1") {
        procesdatalift1(payload);
        }else if (message.destinationName === "/conveyor/state/lift2") {
        procesdatalift2(payload);
        }else if (message.destinationName === "/conveyor/state/divertor") {
        handleDivertorMessage(payload);
        }else if (message.destinationName === "/conveyor/state/motoarerole") {
        handleMotorRoleMessage(payload);
        }else if (message.destinationName === "/conveyor/state/safety") {
        handleSafetyMessage(payload);
        }else if (message.destinationName === "/conveyor/state/senzorilift1") {
        handleSenzoriLift1Message(payload);
        }else if (message.destinationName === "/conveyor/state/senzorilift2") {
        handleSenzoriLift2Message(payload);
        }
        
    }
>>>>>>> bc9fff79a1846ad05d7d77ef123b53529c6c7397
    catch{  
    }   
};

function handleSenzoriLift1Message(liftData) {
    if (/^[01]{2}$/.test(liftData)) {
        for (var i = 0; i < liftData.length; i++) {
            var sensorStatus = liftData.charAt(i);
            var sensorElement = document.getElementById("cutia" + (i + 1)); 
            if (sensorStatus === "0") {
                sensorElement.style.visibility = "hidden";
            } else {
                sensorElement.style.visibility = "visible";
            }
        }
    }
}

function handleSenzoriLift2Message(liftData) {
    if (/^[01]{2}$/.test(liftData)) {
        for (var i = 0; i < liftData.length; i++) {
            var sensorStatus = liftData.charAt(i);
            var sensorElement = document.getElementById("cutie" + (i + 1)); 
            if (sensorStatus === "0") {
                sensorElement.style.visibility = "hidden";
            } else {
                sensorElement.style.visibility = "visible";
            }
        }
    }
}


function handleSafetyMessage(safetyData) {

    if (safetyData.includes("1")) {
        isEmergency = true;
    } else {
        isEmergency = false;
    }

    for (var i = 0; i < safetyData.length; i++) {
        var safetyStatus = safetyData.charAt(i);
        var safetyElement = document.getElementById("8" + (i + 1));
        
        if (safetyStatus === "1") {
            safetyElement.style.backgroundColor = "rgb(226, 7, 7)";
        } else {
            safetyElement.style.backgroundColor = "rgb(85, 228, 85)";
        }
    }
};


function procesdatalift1(mesajLift1){
    var sts = mesajLift1.split('/');
    var encoder1 = sts[0];
    var safety1 = sts[1];
    var isError1 = sts[2];
    var status1 = sts[3];

    var circle = document.getElementById("poza");
    var encoderValue = parseFloat(encoder1);

    console.log(encoderValue);

    encoderValue = Math.min(3100, Math.max(0, encoderValue));
    
    var encoder1 = 465 - ((encoderValue / 3110) * 465);

    circle.setAttribute('y', encoder1);

    
    var dx = document.getElementById("51");
    if(safety1=="1"){
        dx.style.backgroundColor = "rgb(226, 7, 7)";
    }else{
        dx.style.backgroundColor = "rgb(85, 228, 85)";
    }

    var enc = document.getElementById("encoder1");
    var en = Math.abs(Math.floor(parseInt(encoder1)));
    enc.innerText = en;

    var err = document.getElementById("31");
    if(isError1 == "True"){
        err.style.backgroundColor = "rgb(226, 7, 7)";
    }else{
        err.style.backgroundColor = "rgb(85, 228, 85)";
    }

    var ste = document.getElementById("status1");
    ste.innerText = status1

};

function procesdatalift2(mesajLift2){
    var sts = mesajLift2.split('/');
    var encoder2 = sts[0];
    var safety2 = sts[1];
    var isError2 = sts[2];
    var status2 = sts[3];

    var circle = document.getElementById("pozalift");
    var encoderValue = parseFloat(encoder2);

    console.log(encoderValue);

    encoderValue = Math.min(3100, Math.max(0, encoderValue));
    
    var encoder2 = 465 - ((encoderValue / 3110) * 465);

    circle.setAttribute('y', encoder2);
    
    var dx = document.getElementById("52");
    if(safety2=="1"){
        dx.style.backgroundColor = "rgb(226, 7, 7)";
    }else{
        dx.style.backgroundColor = "rgb(85, 228, 85)";
    }

    var enc = document.getElementById("encoder2");
    var en = Math.abs(Math.floor(parseInt(encoder2)));
    enc.innerText = en;

    var err = document.getElementById("32");
    if(isError2 == "True"){
        err.style.backgroundColor = "rgb(226, 7, 7)";
    }else{
        err.style.backgroundColor = "rgb(85, 228, 85)";
    }

    var ste = document.getElementById("status1");
    ste.innerText = status2

};

function handleSensorMessage(sensorData) {

    if (/^[01]{19}$/.test(sensorData)) {
        for (var i = 0; i < sensorData.length; i++) {
            var sensorStatus = sensorData.charAt(i);
            var sensorElement = document.getElementById("2" + (i + 1));
            if (sensorStatus === "0") {
            sensorElement.style.backgroundColor = "rgb(85, 228, 85)";
            } else {
            sensorElement.style.backgroundColor = "rgb(235, 143, 5)";
            }
        }
    }
};

function handleMotorMessage(motorData) {

    if (/^[0-5]{4}$/.test(motorData)) {
        for (var i = 0; i < motorData.length; i++) {
            var motorStatus = motorData.charAt(i);
            var motorElement = document.getElementById("1" + (i + 1));
            
            switch (motorStatus) {
            case "0":
                motorElement.style.backgroundColor = "gray";
                break;
            case "1":
                motorElement.style.backgroundColor = "rgb(85, 228, 85)";
                break;
            case "2":
                motorElement.style.backgroundColor = "yellow";
                break;
            case "3":
                motorElement.style.backgroundColor = "rgb(10, 190, 235)";
                break;
            case "4":
                motorElement.style.backgroundColor = "rgb(235, 143, 5)";
                break;
            case "5":
                motorElement.style.backgroundColor = "rgb(226, 7, 7)";
                break;
            }
        }
    }
};

function handleMotorRoleMessage(motorroleData) {

    if (/^[0-5]{6}$/.test(motorroleData)) {
        for (var i = 0; i < motorroleData.length; i++) {
            var motorRoleStatus = motorroleData.charAt(i);
            var motorRoleElement = document.getElementById("7" + (i + 1));
            
            switch (motorRoleStatus) {
            case "0":
                motorRoleElement.style.backgroundColor = "gray";
                break;
            case "1":
                motorRoleElement.style.backgroundColor = "rgb(85, 228, 85)";
                break;
            case "2":
                motorRoleElement.style.backgroundColor = "yellow";
                break;
            case "3":
                motorRoleElement.style.backgroundColor = "rgb(10, 190, 235)";
                break;
            case "4":
                motorRoleElement.style.backgroundColor = "rgb(235, 143, 5)";
                break;
            case "5":
                motorRoleElement.style.backgroundColor = "rgb(226, 7, 7)";
                break;
            }
        }
    }
};

function handleLiftMessage(liftData) {
    var liftButton = document.getElementById("liftButton");
    var scanlft = document.getElementById("scanlft");
    var hasLift = liftData.includes('2');

    if (hasLift) {
        liftButton.textContent = "Offline";
        scanlft.style.backgroundColor = 'rgb(226, 7, 7)';
        } else {
        liftButton.textContent = "Online";
        scanlft.style.backgroundColor = 'rgb(85, 228, 85)';
    }


    if (/^[0-2]{2}$/.test(liftData)) {
        for (var i = 0; i < liftData.length; i++) {
            var liftStatus = liftData.charAt(i);
            var liftElement = document.getElementById("3" + (i + 1));
            
            switch (liftStatus) {
            case "0":
                liftElement.style.backgroundColor = "gray";
                break;
            case "1":
                liftElement.style.backgroundColor = "rgb(85, 228, 85)";
                break;
            case "2":
                liftElement.style.backgroundColor = "rgb(226, 7, 7)";
                break;
            }
        }
    }

};

function handleDivertorMessage(divertorData) {

    if (/^[0-2]{1}$/.test(divertorData)) {
        for (var i = 0; i < divertorData.length; i++) {
            var divertorStatus = divertorData.charAt(i);
            var divertorElement = document.getElementById("4" + (i + 1));
            
            switch (divertorStatus) {
            case "0":
                divertorElement.style.backgroundColor = "gray";
                break;
            case "1":
                divertorElement.style.backgroundColor = "rgb(85, 228, 85)";
                break;
            case "2":
                divertorElement.style.backgroundColor = "rgb(226, 7, 7)";
                break;
            }
        }
    }
};


mqtt.onMessageArrived = onMessageArrived;

// mqttConnect();