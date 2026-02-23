#!/usr/bin/python

import sys
import os
import re, shutil, tempfile

def execExitOnFail(cmd, message):
    code = os.system(cmd);
    if code:
        fatalError(message);

def fatalError(message):
    print message
    sys.exit()

def sedCmd(pattern, repl, filename):
    '''
    Perform the pure-Python equivalent of in-place `sed` substitution: e.g.,
    `sed -i -e 's/'${pattern}'/'${repl}' "${filename}"`.
    '''
    # For efficiency, precompile the passed regular expression.
    pattern_compiled = re.compile(pattern)

    # For portability, NamedTemporaryFile() defaults to mode "w+b" (i.e., binary
    # writing with updating). This is usually a good thing. In this case,
    # however, binary writing imposes non-trivial encoding constraints trivially
    # resolved by switching to text writing. Let's do that.
    with tempfile.NamedTemporaryFile(mode='w', delete=False) as tmp_file:
        with open(filename) as src_file:
            for line in src_file:
                tmp_file.write(pattern_compiled.sub(repl, line))

    # Overwrite the original file with the munged temporary file in a
    # manner preserving file attributes (e.g., permissions).
    shutil.move(tmp_file.name, filename)


def updateFrontend(version):
    sedCmd("\"version\": \"[^ ]*\",", "\"version\": \"" + version +"\",", "frontend/package.json");
    execExitOnFail("git add frontend/package.json", "failed to add cmake to git")

def updateBackend(version):
    sedCmd("\"version\": \"[^ ]*\",", "\"version\": \"" + version +"\",", "backend/package.json");
    sedCmd("\"VERSION\" : \"[^ ]*\",", "\"VERSION\" : \"" + version +"\",", "backend/VERSION.json");
    execExitOnFail("git add backend/package.json  backend/VERSION.json", "failed to add cmake to git")

numArguments = len(sys.argv)

if numArguments < 3:
    fatalError("Usage: " + sys.argv[0] + " <prod/dev> <versionNumber>")

release_type = sys.argv[1]
version = sys.argv[2]

production   = (release_type == "prod")
branch       = "master" if production else "staging"

updateFrontend(version);
updateBackend(version);

execExitOnFail("git commit -m \"Version " + version + "\"", "Failed to commit")

execExitOnFail("git push origin :refs/tags/" + version, "Failed to push tag")
execExitOnFail("git tag -fa " + version + " -m \" Version " + version + " \"", "Failed to add tag")

execExitOnFail("git push origin --tags", "Failed to update tag")
execExitOnFail("git push", "Failed to push upstream")

