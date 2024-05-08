from flowsort import FlowSort
import paho.mqtt.client as mqtt

flowsort1 = FlowSort("192.168.202.23","192.168.202.8","flow3","1",0,420,210)

flowsort1.goHome()

flowsort1.updatePosition()