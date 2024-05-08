from flowsort import FlowSort

def stepToAngle(angle):
    steps = angle * 0.87
    return steps

flowsort1 = FlowSort("192.168.202.40","192.168.202.8","flow21","6",0,240,430,128)

flowsort1.goHome()

flowsort1.updatePosition()
