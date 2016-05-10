#github repository
githubRepo = "https://github.com/3drepo/3drepo.io"

#Release tag 
release_tag = "v1.0.0b"

#QT installer directory
qtInstallerexe = "c:\\Qt\\QtIFW2.0.1\\bin\\binarycreator.exe"

#-------------------- SCRIPT BEGINS -----------------------------
import os
import shutil

rootDir = os.getcwd();
tmpDir = "tmp"
installerDir = os.path.join(tmpDir , "installer")
repoioDir = os.path.join(tmpDir , "3drepo.io")

os.system("mkdir  " + tmpDir);
os.system("mkdir  " + installerDir);

#copy the installer into /tmp
os.system("xcopy installer " + installerDir + " /s /e")

#clone and setup 3drepo.io
os.chdir(tmpDir)
os.system("git clone -b "  + release_tag + " --single-branch " + githubRepo);
os.chdir("3drepo.io")

#clone + compile x3dom 
os.system("git submodule update --init");
print os.getcwd();
x3domDir = os.path.join("submodules", "x3dom")
print x3domDir
os.chdir(x3domDir)
os.system("python manage.py --build")
#remove everything apart from the distribution
for dirname, subDirList, flist in os.walk('.'):
	for subdirName in subDirList:
		if "dist" != subdirName:
			shutil.rmtree(subdirName)
	for fileName in flist:
		os.remove(fileName)
	break

os.chdir("..\\..\\")

#npm install
os.system("npm install --production")
os.system("grunt frontend")

#create configuration file
config_dir = os.path.join("config", "prod")
os.system("mkdir " + config_dir)
configFileMaster = os.path.join(rootDir, "extras", "config.js");
configDestFile = os.path.join(config_dir, "config.js")
os.system("cp \"" + configFileMaster  + "\" " + configDestFile)
cmdFile = os.path.join(rootDir,"extras", "launch3DRepoIO.cmd");
os.system("cp \"" + cmdFile + "\" launch3DRepoIO.cmd")

os.chdir(rootDir)
#move 3drepo.io into the installer
dataDir = os.path.join(installerDir, "packages", "org.3drepo.io", "data")
for dirname, subDirList, flist in os.walk(repoioDir):
	for subdirName in subDirList:
		if not ".git" in subdirName:
			pathToSrc = os.path.join(repoioDir, subdirName)
			shutil.move(pathToSrc, dataDir)
	for fileName in flist:
		if not ".git" in subdirName:
			pathToSrc = os.path.join(repoioDir, fileName)
			shutil.move(pathToSrc, dataDir)
	break
	

#create the installer
installerConfig = os.path.join(installerDir, "config.xml")
packageDir = os.path.join(installerDir, "packages")
os.system(qtInstallerexe + " -c "+installerConfig+" -p " + packageDir + " 3DRepoIO.exe")



