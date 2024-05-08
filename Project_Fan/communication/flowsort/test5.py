import time

import os


cmd = "mosquitto_pub -t /diverter/flowsort/5 -m start"

os.system(cmd)




while True:

        cmd = "mosquitto_pub -t /diverter/flowsort/5 -m left"

        os.system(cmd)

        time.sleep(.8)

        cmd = "mosquitto_pub -t /diverter/flowsort/5 -m forward"

        os.system(cmd)

        time.sleep(.8)

        cmd = "mosquitto_pub -t /diverter/flowsort/5 -m right"

        os.system(cmd)

        time.sleep(.8)

        cmd = "mosquitto_pub -t /diverter/flowsort/5 -m forward"

        os.system(cmd)

        time.sleep(.8)