#!/usr/bin/python

import sys

def fatalError(message):
    print message
    sys.exit()

numArguments = len(sys.argv)

if numArguments < 1:
    fatalError("Please specify release tag name")

tagName = sys.argv[0]

os.system("cd ../..")

code = os.system("grunt webfont")

if code:
    fatalError("Webfont compilation failed")

code = os.system("grunt frontend")

if code:
    fatalError("Frontend compilation failed")

code = os.system("git checkout master")

if code:
    fatalError("git checkout failed")

code = 0

code |= os.system("git add -f ./public/css/external/three-d-repo.css")
code |= os.system("git add -f ./public/css/fonts/three-d-repo.woff")
code |= os.system("git add -f ./public/css/fonts/three-d-repo.eot")
code |= os.system("git add -f ./public/css/fonts/three-d-repo.ttf")
code |= os.system("git add -f ./public/dist")

if code:
    fatalError("git force add failed")

os.system("git commit -m \"Version " + tagName + "\"")

os.system("sed -i.bak 's/const VERSION=\"[^ ]*\"/const VERSION=\"" + tagName + "\"/' backend/config.js")

os.system("git tag -a " + tagName + " -m \" Version " + tagName + " \"")
os.system("git push origin :refs/tags/latest")
os.system("git tag -fa latest")
os.system("git push origin --tags")

os.system("git push")

