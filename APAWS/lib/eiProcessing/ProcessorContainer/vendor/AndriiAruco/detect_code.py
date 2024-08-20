import cv2
import os
import json
import sys
import re
import time

start_time = time.time()

#Set working directory to provided
print('Current directory: ' + os.getcwd())
print('Chaning directory to: ' + sys.argv[2])
os.chdir(sys.argv[2])
dictionaryPath = os.path.abspath(os.path.join(sys.argv[2], 'markers/custom_dictionary.yml'))
print(dictionaryPath)
fs = cv2.FileStorage(dictionaryPath, cv2.FILE_STORAGE_READ)
custom_dictionary = cv2.aruco.Dictionary()
custom_dictionary.readDictionary(fs.getNode("Custom Dictionary"))

dir_path = sys.argv[1]

DetectionResults = {}
DetectionResults["success"] = "undefined"
DetectionResults["error"] = "undefined"
DetectionResults["scannedImages"] = []

image_records = []

def detect_markers(image_path:str, dictionary):
    
    try:
        numbers = []
        image = cv2.imread(image_path)

        parameters =  cv2.aruco.DetectorParameters()
        detector = cv2.aruco.ArucoDetector(dictionary, parameters)

        corners, ids, rejectedImgPoints = detector.detectMarkers(image)

        if ids is not None:
            numbers = ids.flatten().tolist()   
        image_rec = {}
        
        words = re.split('/|\\\\', image_path)
        image_rec[words[-1]] = numbers
        image_records.append(image_rec)
        return True
    except Exception as e:
        DetectionResults["error"] = "Exception occured: " + str(e)
        return False 
    

files = [f for f in os.listdir(dir_path)]
i = 0
if len(files) != 0:
    for file in files:
        i += 1
        print('Processing file: ' + file)
        print(str(i / len(files) * 100) + '%' + ' done')

        if(detect_markers(os.path.join(dir_path, file), custom_dictionary) and DetectionResults["success"] != "false"):
            DetectionResults["success"] = "true"
            DetectionResults["error"] = "undefined"
            DetectionResults["scannedImages"] = image_records
        elif(detect_markers(os.path.join(dir_path, file), custom_dictionary) and DetectionResults["success"] == "false"):
            DetectionResults["scannedImages"] = image_records
        elif(detect_markers(os.path.join(dir_path, file), custom_dictionary) is False):
            DetectionResults["success"] = "false"
else:
    DetectionResults["success"] = "false"
    DetectionResults["error"] = "Images are not found"
    DetectionResults["scannedImages"] = []

with open(os.path.abspath(os.path.join(dir_path)) + "/AndriiDetectorOutput.json", "w") as file:
    file.write(json.dumps(DetectionResults, indent=4))
    
print(time.time() - start_time)

