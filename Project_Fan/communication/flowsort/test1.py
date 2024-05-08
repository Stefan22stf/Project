import time

import os





while True:

        cmd = "mosquitto_pub -t /diverter/flowsort/1 -m left"

        os.system(cmd)

        cmd = "mosquitto_pub -t /diverter/flowsort/1 -m start"

        os.system(cmd)

        time.sleep(.5)

        cmd = "mosquitto_pub -t /diverter/flowsort/1 -m forward"

        os.system(cmd)

        cmd = "mosquitto_pub -t /diverter/flowsort/1 -m start"

        os.system(cmd)

        time.sleep(.8)

        cmd = "mosquitto_pub -t /diverter/flowsort/1 -m right"

        os.system(cmd)

        cmd = "mosquitto_pub -t /diverter/flowsort/1 -m start"

        os.system(cmd)

        time.sleep(.8)

        cmd = "mosquitto_pub -t /diverter/flowsort/1 -m forward"

        os.system(cmd)

        cmd = "mosquitto_pub -t /diverter/flowsort/1 -m start"

        os.system(cmd)

        time.sleep(.8)