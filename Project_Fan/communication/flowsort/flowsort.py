import paho.mqtt.client as mqtt
from pyModbusTCP.client import ModbusClient
import time

class FlowSort:

    def __init__(self, host, server, clientId, flowsortId, left=0, right=420, forward=210, dir=0):
        self.host = host
        self.server = server
        self.c = ModbusClient(host=self.host, port=502, unit_id=1, auto_open=True)
        self.connect = False
        self.id = flowsortId
        self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1, clientId)
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.on_disconnect = self.on_disconnect
        self.left = left
        self.right = right
        self.forward = forward
        self.dir = dir

    def on_connect(self, client, userdata, flags, rc):
        print("Connected with result code " + str(rc))
        client.subscribe(f"/diverter/flowsort/{self.id}")
        client.subscribe(f"/diverter/flowsort/all")

    def on_message(self, client, userdata, msg):
        print(msg.topic + " " + str(msg.payload))
        m = msg.payload.decode().rstrip()
        if m == "right":
            self.c.write_single_register(8, 0)
            self.c.write_single_register(7,self.right)
            self.c.write_single_register(8,2)
        if m == "left":
            self.c.write_single_register(8, 0)
            self.c.write_single_register(7, self.left)
            self.c.write_single_register(8, 2)
        if m == "forward":
            self.c.write_single_register(8, 0)
            self.c.write_single_register(7, self.forward)
            self.c.write_single_register(8, 2)
        if m == "stop":
            self.c.write_single_register(269,0)
        if m == "start":
            self.c.write_single_register(269,1)
        if m == "home":
            self.goHome()

    def on_disconnect(self, client, userdata, rc):
        self.connect = False


    def goHome(self):
        self.c.write_single_register(39,10)
        self.c.write_single_register(259,1)
        while self.c.read_holding_registers(34)[0] !=0:
            pass
        self.c.write_single_register(259,0)
        self.c.write_single_register(8,1)
        self.c.write_single_register(8,0)
        self.c.write_single_register(7,700)
        self.c.write_single_register(8,2)
        time.sleep(4)
        self.c.write_single_register(8,1)
        self.c.write_single_register(8,0)
        self.c.write_single_register(7,210)
        self.c.write_single_register(8,2)
        self.c.write_single_register(39, 1500)
        self.c.write_single_register(63, 7000)
        self.c.write_single_register(269,0)


    def updatePosition(self):
        self.client.connect(self.server, 1883, 60)
        while True:
            if self.connect == False:
                self.client.connect(self.server, 1883, 60)
            self.client.loop_forever()
