#!/usr/bin/python

import sys
import os

def fatalError(message):
    print message
    sys.exit()

numArguments = len(sys.argv)

if numArguments < 2:
    fatalError("Usage: " + sys.argv[0] + " <prod/dev> <version>")

release_type = sys.argv[1]
version      = sys.argv[2]

production   = (release_type == "prod")
branch       = "staging" if production else "master"

os.system("cd ../..")

code = os.system("git checkout " + branch)

if code:
    fatalError("git checkout failed")

code = os.system("grunt webfont")

if code:
    fatalError("Webfont compilation failed")

code = os.system("grunt frontend")

if code:
    fatalError("Frontend compilation failed")

code = 0

if production:
    code |= os.system("git add -f ./public/css/external/three-d-repo.css")
    code |= os.system("git add -f ./public/css/fonts/three-d-repo.woff")
    code |= os.system("git add -f ./public/css/fonts/three-d-repo.eot")
    code |= os.system("git add -f ./public/css/fonts/three-d-repo.ttf")
    code |= os.system("git add -f ./public/dist")

if code:
    fatalError("git force add failed")

os.system("git commit -m \"Version " + tagName + "\"")

os.system("sed -i.bak 's/const VERSION=\"[^ ]*\"/const VERSION=\"" + tagName + "\"/' backend/config.js")

os.system("git add backend")
os.system("git clean -f -d")

os.system("git commit -m \"Version string update\"")

os.system("git tag -a " + tagName + " -m \" Version " + tagName + " \"")

if production:
    os.system("git push origin :refs/tags/latest")
    os.system("git tag -fa latest -m \"Update latest\"")

os.system("git push origin --tags")
os.system("git push")

