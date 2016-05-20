#!/bin/bash
import os, shutil, urllib, sys, zipfile, re

#github repository
githubRepo = "https://github.com/3drepo/3drepo.io"

#Release tag
release_tag = "latest"

_platform = sys.platform

#QT installer binary
if _platform == "linux" or _platform == "linux2":
   qtInstaller = "binarycreator"
elif _platform == "darwin":
   # MAC OS X
   qtInstaller = "binarycreator"
elif _platform == "win32":
   # Windows
   qtInstaller = "c:\\users\\timot\\Desktop\\installer-framework\\bin\\binarycreator.exe"
   #qtInstaller = "c:\\Qt\\QtIFW2.0.1\\bin\\binarycreator.exe"

#-------------------- SCRIPT BEGINS -----------------------------

releaseDir = os.getcwd()
tmpDir = "."
installerDir = os.path.join(tmpDir , "installer")

destDir = os.path.join(installerDir, "packages", "org.3drepo.io", "data")
repoioDir = os.path.join(destDir, "3drepo.io")
configDir = os.path.join(repoioDir, "config", "prod")
x3domDir = os.path.join(repoioDir, "submodules", "x3dom")

if os.path.exists(repoioDir):
    print "Removing tmp directory"
    shutil.rmtree(repoioDir)

print "Creating tmp directory"

#os.makedirs(tmpDir)

#copy the installer into /tmp
print "Copying installer directory"
#shutil.copytree("installer",installerDir)

#clone and setup 3drepo.io

#Download latest release zipball
print "Downloading 3drepo zip file"
#urllib.urlretrieve("http://github.com/3drepo/3drepo.io/zipball/latest", "3drepo.zip")

# Extract web server
print "Extracting 3drepo zip file"
repoFile = zipfile.ZipFile("3drepo.zip")
repoFile.extractall(destDir)

repoUnpackDir = [f for f in os.listdir(destDir) if re.match(r'3drepo-.*', f)]
shutil.move(os.path.join(destDir, repoUnpackDir[0]), repoioDir)

##create configuration file
print "Creating configuration file"
config_dir = os.path.join(repoioDir, "config", "prod")
os.makedirs(config_dir)
configFileMaster = os.path.join("extras", "config.js")
configDestFile = os.path.join(config_dir, "config.js")

shutil.copy(configFileMaster, configDestFile)

cmdFile = os.path.join("extras", "launch3DRepoIO.cmd")
shutil.copy(cmdFile, os.path.join(repoioDir, "launch3DRepoIO.cmd"))


print "Downloading x3dom zip file"
#rllib.urlretrieve("http://github.com/3drepo/x3dom/zipball/latest", "x3dom.zip")

# Extract x3dom
print "Extracting x3dom zip file"
repoFile = zipfile.ZipFile("x3dom.zip")
repoFile.extractall(repoioDir)

x3domUnpackDir = [f for f in os.listdir(repoioDir) if re.match(r'3drepo-x3dom-.*', f)]

shutil.rmtree(x3domDir)
shutil.move(os.path.join(repoioDir, x3domUnpackDir[0]), x3domDir)

os.chdir(x3domDir)

print "Building x3dom"
os.system("python manage.py --build")

print "Cleaning x3dom"
#remove everything apart from the distribution
for dirname, subDirList, flist in os.walk('.'):
	for subdirName in subDirList:
		if "dist" != subdirName:
			shutil.rmtree(subdirName)
	for fileName in flist:
		os.remove(fileName)
	break

os.chdir(os.path.join("..",".."))

#npm install
print "NPM install"
os.system("npm install --production")
os.system("grunt frontend")

os.chdir(os.path.join("..","..","..",".."))

#create the installer
print "Creating installer"
installerConfig = os.path.join(installerDir, "config.xml")
packageDir = os.path.join(installerDir, "packages")
os.system(qtInstaller + " -c "+installerConfig+" -p " + packageDir + " 3DRepoIO.exe")

