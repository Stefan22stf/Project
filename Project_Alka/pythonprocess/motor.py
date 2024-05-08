import os, sys, clr, time
import paho.mqtt.client as mqtt

dll_dir = './'
dllname = 'EAL'
path = r'%s%s' % (dll_dir, dllname)
sys.path.append(os.getcwd())
clr.AddReference(path)

import EAL  # imports EAL.dll
from EAL.EALConnection import *

# Creates EAL connnection object
conn = EALConnection()

print("Connecting")
# Connects to drive
conn.Connect("192.168.1.2")
print("Connected")


print("Read parameter")
# Read parameter
print(conn.Parameter.Axes[0].ReadDataAsString("S-0-0277"))
print("Reading finished...")

t = time.time()

# The callback for when the client receives a CONNACK response from the server.
def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))

    # Subscribing in on_connect() means that if we lose the connection and
    # reconnect then subscriptions will be renewed.
    client.subscribe("/diagnosis/process/list")

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
    print(msg.topic+" "+str(msg.payload))


client = mqtt.Client()

client.on_connect = on_connect
client.on_message = on_message

client.connect("192.168.1.124", 1883, 60)

while True:
    client.loop(.1)
    if time.time() - t > .5:
        encoderPos = conn.Parameter.Axes[0].ReadDataAsString("S-0-0051") # encoder position
        STOstate = conn.Parameter.Axes[0].ReadDataAsString("P-0-0106.0.0") # STO stage locked
        var = STOstate[18] + STOstate[19]
        print(var + " " + STOstate)
        if var != "00":
            var = "1"
        else:
            var = "0"
        isError = conn.Motion.Axes[0].IsError 
        errorText = conn.Parameter.Axes[0].ReadDataAsString("S-0-0095") # eroare 
        data = str(encoderPos) + "/" + var + "/" + str(isError) + "/" + str(errorText)
        client.publish("/conveyor/state/lift1",data)
        print(data)
        t = time.time()

    
# Disconnects method
conn.Disconnect()
print("Disconnected.")