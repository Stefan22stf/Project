import time

import os





while True:

        cmd = "mosquitto_pub -t /diverter/flowsort/3 -m left"

        os.system(cmd)

        cmd = "mosquitto_pub -t /diverter/flowsort/3 -m start"

        os.system(cmd)

        time.sleep(.5)

        cmd = "mosquitto_pub -t /diverter/flowsort/3 -m forward"

        os.system(cmd)

        cmd = "mosquitto_pub -t /diverter/flowsort/3 -m start"

        os.system(cmd)

        time.sleep(.8)

        cmd = "mosquitto_pub -t /diverter/flowsort/3 -m right"

        os.system(cmd)

        cmd = "mosquitto_pub -t /diverter/flowsort/3 -m start"

        os.system(cmd)

        time.sleep(.8)

        cmd = "mosquitto_pub -t /diverter/flowsort/3 -m forward"

        os.system(cmd)

        cmd = "mosquitto_pub -t /diverter/flowsort/3 -m start"

        os.system(cmd)

        time.sleep(.8)