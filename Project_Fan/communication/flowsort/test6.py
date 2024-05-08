import time

import os


cmd = "mosquitto_pub -t /diverter/flowsort/9 -m start"

os.system(cmd)




while True:

        cmd = "mosquitto_pub -t /diverter/flowsort/9 -m left"

        os.system(cmd)

        time.sleep(.3)

        cmd = "mosquitto_pub -t /diverter/flowsort/9 -m forward"

        os.system(cmd)

        time.sleep(.3)

        cmd = "mosquitto_pub -t /diverter/flowsort/9 -m right"

        os.system(cmd)

        time.sleep(.3)

        cmd = "mosquitto_pub -t /diverter/flowsort/9 -m forward"

        os.system(cmd)

        time.sleep(.3)