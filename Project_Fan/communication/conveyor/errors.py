import socket
import paho.mqtt.client as mqtt
import time

global s
global connect

connect = False

# The callback for when the client receives a CONNACK response from the server.
def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("/diverter/flowsort/eroare/#")

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
    print(msg.topic+" "+str(msg.payload))
    if msg.topic.startswith("/diverter/flowsort/eroare"):
        client.publish("/conveyor/state","stop")


def on_disconnect(client, userdata, rc):
    global connect
    print("disconnecting reason  "  + str(rc))
    connect = False
    
    

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1,"erorute")
client.on_connect = on_connect
client.on_message = on_message

client.connect("localhost", 1883, 60)

tsc = time.time()

while True:
    try:
        if connect == False:
            client.connect("localhost", 1883, 60)
            connect = True
        client.loop(.1)
    except Exception as ex:
            print(ex)
    try:
        if time.time() - tsc >5:
            client.publish("/conveyor/error/status","keepalive")
            tsc = time.time()
    except Exception as ex:
        print(ex)