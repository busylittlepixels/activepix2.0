import cv2
import os
import numpy as np
from yolov8 import YOLOv8
import math


human_model_path = "./models/yolov8s.onnx"
human_detector = YOLOv8(human_model_path, conf_thres=0.5, iou_thres=0.5)
aruco_model_path = "./models/aruco.onnx"
aruco_detector = YOLOv8(aruco_model_path, conf_thres=0.5, iou_thres=0.5)
dictionary_file = "./models/custom_dictionary.npy"
custom_dict_array = np.load(dictionary_file)
custom_dict = cv2.aruco.Dictionary_create(1, 6)
custom_dict.bytesList = custom_dict_array
arucoParams = cv2.aruco.DetectorParameters_create()
Conf_threshold = 0.4
NMS_threshold = 0.4


import argparse
parser = argparse.ArgumentParser()
parser.add_argument("--image", '-i',  help='image path')
parser.add_argument("--output", '-o',  help='output image path')
args = parser.parse_args()


img_frame = cv2.imread(args.image)
back_image_frame = img_frame.copy()
image_width = img_frame.shape[1]
image_height = img_frame.shape[0]

boxes, scores, class_ids = human_detector(img_frame)
for index, box in enumerate(boxes):
    if class_ids[index] == 0:
        h_x1 = int(box[0])
        if h_x1 < 0:
            h_x1 = 0
        h_y1 = int(box[1])
        if h_y1 < 0:
            h_y1 = 0

        h_x2 = int(box[2])
        if h_x2 > img_frame.shape[1] - 1:
            h_x2 = img_frame.shape[1] - 1
        h_y2 = int(box[3])
        if h_y2 > img_frame.shape[0] - 1:
            h_y2 = img_frame.shape[0] - 1
        cv2.rectangle(back_image_frame, (h_x1, h_y1), (h_x2, h_y2), (0, 255, 0), 4)
        org_human_image = img_frame[h_y1:h_y2, h_x1:h_x2]
        a_boxes, a_scores, a_class_ids = aruco_detector(org_human_image)

        for inx, a_box in enumerate(a_boxes):
            x1 = int(a_box[0])
            if x1 < 0:
                x1 = 0
            y1 = int(a_box[1])
            if y1 < 0:
                y1 = 0
            x2 = int(a_box[2])
            if x2 > org_human_image.shape[1] - 1:
                x2 = org_human_image.shape[1] - 1
            y2 = int(a_box[3])
            if y2 > org_human_image.shape[0] - 1:
                y2 = org_human_image.shape[0] - 1

            aruco_image = org_human_image[y1:y2, x1:x2]

            corners, ids, rejectedImgPoints = cv2.aruco.detectMarkers(aruco_image, custom_dict,
                                                                      parameters=arucoParams)

            # If markers are detected, add them to the list
            if len(corners) > 0:
                # flatten the ArUco IDs list
                ids = ids.flatten()

                # loop over the detected ArUCo corners
                for (markerCorner, markerID) in zip(corners, ids):
                    # extract the marker corners (which are always returned in
                    # top-left, top-right, bottom-right, and bottom-left order)
                    corners = markerCorner.reshape((4, 2))
                    (topLeft, topRight, bottomRight, bottomLeft) = corners

                    # convert each of the (x, y)-coordinate pairs to integers
                    topRight = (h_x1 + x1 + int(topRight[0]), h_y1 + y1 + int(topRight[1]))
                    bottomRight = (h_x1 + x1 + int(bottomRight[0]), h_y1 + y1 + int(bottomRight[1]))
                    bottomLeft = (h_x1 + x1 + int(bottomLeft[0]), h_y1 + y1 + int(bottomLeft[1]))
                    topLeft = (h_x1 + x1 + int(topLeft[0]), h_y1 + y1 + int(topLeft[1]))

                    distance1 = math.sqrt((topRight[0] - topLeft[0]) ** 2 + (topRight[1] - topLeft[1]) ** 2)
                    distance2 = math.sqrt((topRight[0] - bottomRight[0]) ** 2 + (topRight[1] - bottomRight[1]) ** 2)

                    if distance1 > 30 and distance2 > 30:

                        # draw the bounding box of the ArUCo detection
                        cv2.line(back_image_frame, topLeft, topRight, (0, 255, 0), 2)
                        cv2.line(back_image_frame, topRight, bottomRight, (0, 255, 0), 2)
                        cv2.line(back_image_frame, bottomRight, bottomLeft, (0, 255, 0), 2)
                        cv2.line(back_image_frame, bottomLeft, topLeft, (0, 255, 0), 2)

                        # compute and draw the center (x, y)-coordinates of the ArUco
                        # marker
                        cX = int((topLeft[0] + bottomRight[0]) / 2.0)
                        cY = int((topLeft[1] + bottomRight[1]) / 2.0)
                        cv2.circle(back_image_frame, (cX, cY), 4, (0, 0, 255), -1)

                        # draw the ArUco marker ID on the image
                        cv2.putText(back_image_frame, str(markerID),
                                    (topLeft[0], topLeft[1] - 5), cv2.FONT_HERSHEY_SIMPLEX,
                                    1, (0, 0, 255), 2)
                        print("[INFO] ArUco marker ID: {}".format(markerID))

                cv2.rectangle(back_image_frame, (h_x1 + x1, h_y1 + y1), (h_x1 + x2, h_y1 + y2), (0, 255, 0), 4)
cv2.imwrite(args.output, back_image_frame)









