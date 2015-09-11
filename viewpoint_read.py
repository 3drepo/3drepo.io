#!/usr/bin/python

import sys, traceback
from bs4 import BeautifulSoup

def quatToMatrix (quat):
	qx = quat[0];
	qy = quat[1];
	qz = quat[2];
	qw = quat[3];

	return [[1 - 2 * qy * qy - 2 * qz * qz, 2 * qx * qy - 2 * qz * qw, 2 * qx * qz + 2 * qy * qw],
			[2 * qx * qy + 2 * qz * qw, 1 - 2 * qx * qx - 2 * qz * qz, 2 * qy * qz - 2 * qx * qw],
			[2 * qx * qz - 2 * qy * qw, 2 * qy * qz + 2 * qx * qw, 1 - 2 * qx * qx - 2 * qy * qy]];

#	return [[1 - 2 * qy * qy - 2 * qz * qz, 2 * qx * qy + 2 * qz * qw, 2 * qx * qz - 2 * qy * qw],
#				[2 * qx * qy - 2 * qz * qw, 1 - 2 * qx * qx - 2 * qz * qz, 2 * qy * qz + 2 * qx * qw],
#	[2 * qx * qz + 2 * qy * qw, 2 * qy * qz - 2 * qx * qw, 1 - 2 * qx * qx - 2 * qy * qy]];

if len(sys.argv) < 2:
	print "Not enough arguments provided.";
	sys.exit(0);

xmldoc = open(sys.argv[1]).read();
soup = BeautifulSoup(xmldoc);

viewArray = soup.findAll("view");

collection = "103EW-A-BASEMENT"

for view in viewArray:
	cam = view.viewpoint.camera;
	if (cam['projection'] == "persp"):
		myPos = [float(cam.position.pos3f['x']), float(cam.position.pos3f['y']), float(cam.position.pos3f['z'])];
		myQuat = [float(cam.rotation.quaternion['a']), float(cam.rotation.quaternion['b']), float(cam.rotation.quaternion['c']), float(cam.rotation.quaternion['d'])];
		myMat = quatToMatrix(myQuat);
		myRight = [myMat[0][0], myMat[1][0], myMat[2][0]];
		myUp    = [myMat[0][1], myMat[1][1], myMat[2][1]];
		myView  = [-myMat[0][2], -myMat[1][2], -myMat[2][2]];

		print "db[\"" + collection + ".scene\"].update(", "{ name: \"" + view['name'] + "\", \"type\" : \"camera\" }, {$set : { \"look_at\" : ", myView , ", \"up\" : ", myUp, " }});"

