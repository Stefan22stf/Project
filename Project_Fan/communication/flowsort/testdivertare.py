import os

for i in range(1,50):
    cmd = f"mosquitto_pub -t /conveyor/divert -m 1:2"
    os.system(cmd)

# for i in range(1,11):
#     if i < 10:
#         cmd = f"mosquitto_pub -t /conveyor/divert -m 1:{str(i)}"
#     else:
#         cmd = f"mosquitto_pub -t /conveyor/divert -m 1:{str(i)}"
#     os.system(cmd)