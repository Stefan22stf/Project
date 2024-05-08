import socket
import time
import mysql.connector
import paho.mqtt.client as mqtt

global connect

connect = False

# The callback for when the client receives a CONNACK response from the server.
def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
    print(msg.topic+" "+str(msg.payload))

def on_disconnect(client, userdata, rc):
    global connect
    print("disconnecting reason  "  + str(rc))
    connect = False
    

client = mqtt.Client("cameruta")
client.on_connect = on_connect
client.on_message = on_message

client.connect("localhost", 1883, 60)

mydb = mysql.connector.connect(
  host="localhost",
  user="myuser",
  password="mypass",
  database="translog"
)

mycursor = mydb.cursor()
mydb.autocommit = True

print("Creating server....")
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(.2)
s.bind(("0.0.0.0",5667))
s.listen(1)

c = 0

interval = time.time()

ping = '\x02' + "HB" + '\x03'

def processBarcode(barcode,cursor):
    b = barcode.rstrip()
    for i in range(0,30-len(b)):
        b = "0" + b
    query = "select * from comenzidivertari where status = 0 and barcode = \"" + b + "\" order by id asc limit 1"
    #print(query)
    cursor.execute(query)
    result = cursor.fetchall()
    if result:
        cursor.execute("update comenzidivertari set status=1 where id=" + str(result[0][0]))
        return result
    else:
        return ""

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
        if time.time() - tsc >.2:
            print("send")
            client.publish("/conveyor/scanner/status","keepalive")
            tsc = time.time()
    except Exception as ex:
        print(ex)
    try:
        print("Waiting for connection....")
        conn,addr = s.accept()
        print("-------------------------------")
        print("New connection from " + str(addr[0]))
        conn.settimeout(.2)
        interval = time.time()
        while conn:
            try:
                if connect == False:
                    client.connect("localhost", 1883, 60)
                    connect = True
                client.loop(.1)
            except Exception as ex:
                print(ex)
            try:
                if time.time() - tsc >.2:
                    #print("send")
                    client.publish("/conveyor/scanner/status","keepalive")
                    tsc = time.time()
            except Exception as ex:
                print(ex)
            try:
                if time.time() - interval > 10:
                    conn.close()
                    break
                data = conn.recv(1024).decode()
                if data:
                    if str(data) != "CONNECTED" and str(data)!=ping:
                        data.rstrip()
                        print(str(c) + ".Barcode: " + str(repr(data)))
                        client.publish("/conveyor/camera",data)
                    else:
                        print(str(c) + ".Incoming data: " + str(repr(data)))
                    interval = time.time()
                    c = c + 1
                print("-------------------------------")
            except Exception as ex:
                if str(ex) != "timed out":
                    print(ex)
                    conn.close() 
                    break
    except Exception as ex:
        print(ex)
    