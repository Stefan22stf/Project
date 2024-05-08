import socket
import paho.mqtt.client as mqtt
import time

global s
global connect
global barcode

global id

id = 500

barcode = []

connect = False

# The callback for when the client receives a CONNACK response from the server.
def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("/conveyor/camera")
    client.subscribe("/conveyor/divert")

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
    global barcode
    if msg.topic.startswith("/conveyor/camera"):
        #print(msg.payload[1:-1])
        bc = str(msg.payload.decode()[1:-1])
        barcode.append(bc)
    if msg.topic.startswith("/conveyor/divert"):
        if msg.payload.decode() == "reset":
            print("reset list")
            barcode = []

def on_disconnect(client, userdata, rc):
    global connect
    print("disconnecting reason  "  + str(rc))
    connect = False
    

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1,"cantarut")
client.on_connect = on_connect
client.on_message = on_message

client.connect("localhost", 1883, 60)

print("Creating connection to scale...")
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(('192.168.202.15',4000))
s.settimeout(.2)
print("Connection Successfull...")

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
            client.publish("/conveyor/cantar/status","keepalive")
            tsc = time.time()
    except Exception as ex:
        print(ex)
    try:
        data = s.recv(1024)
        if data:
            #print(repr(data))
            r = data.decode().split('|')
            weight = int(r[6].split(';')[2])
            if weight < 100:
                weight = "0." + str(weight)
            else:
                weight = str(weight/100)
            d = barcode[0].split(';')
            objectData = f"1|{id}|{d[0]}|0000x0000x0000|{weight}"
            id = id + 1
            barcode.pop(0)
            client.publish("/server/socket",objectData)
            print(repr(objectData))
            #client.publish("/conveyor/objectToSend",objectData)
    except socket.timeout:
        pass
    except Exception as ex:
        print(ex)
        s.close()
        print("Creating connection to scale...")
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(('192.168.202.15',4000))
        s.settimeout(.2)
        print("Connection Successfull...")