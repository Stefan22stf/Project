import os

cmd = ["fs1","fs2","fs3","fs4"]

for i in range(1,21):
    os.system(f"pm2 restart fs{i}")

for i in range(20,29):
    os.system(f"pm2 restart fs{i}_t3")

for i in range(28,33):
    os.system(f"pm2 restart fs{i}_t2")