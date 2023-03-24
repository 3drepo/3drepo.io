# Custom logins json looks like this
#
# {
#     "safetibase": {
#       "loginMessage": "Welcome to SafetiBase",
#       "topLogo": "login/sb.png",
#       "topLogoLink": "safetibase.www.3drepo.io",
#       "backgroundImage": "login/sb_bg.png"
#     }
# }

import sys, json
from os.path import exists

if not exists(sys.argv[1]):
  print("")
  sys.exit(0)

output=[]
customLogins=json.load(open(sys.argv[1],"r"))

for key in customLogins:
  for i in customLogins[key]:
    if (customLogins[key][i].count("/") ):
      folderName=customLogins[key][i].split("/")[0]
      if folderName not in output:
        output.append(folderName)

print(' '.join(map(str, output)))
