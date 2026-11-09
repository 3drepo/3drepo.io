var ClientConfig = {
    "maintenanceMode": false,
    "ui": {},
    "uistate": {},
    "structure": {
        "plugin": "home",
        "friends": ["login"],
        "functions": ["register-request", "register-verify", "password-forgot", "password-change", "pricing", "sign-up", "contact", "payment", "billing", "terms", "privacy", "cookies"],
        "children": [{
            "plugin": "account",
            "url": ":account",
            "children": [{
                "plugin": "model",
                "url": "\u002F:model\u002F:revision",
                "params": {
                    "revision": {
                        "value": null,
                        "squash": true
                    },
                    "noSet": {
                        "value": false
                    }
                },
                "children": [{
                    "plugin": "issue",
                    "url": "\u002Fissues\u002F:issue"
                }],
                "friends": ["panel", "filter", "tree", "viewpoints", "issues", "clip", "docs", "utils", "groups", "measure", "right-panel", "building", "revisions"]
            }]
        }]
    },
    "frontendPug": [],
    "development": false,
    "gtm": undefined,
    "userNotice": "",
    "customLogins": undefined,
    "intercomLicense": "y8fuwb81",
    "apryseLicense": "Asite Solutions Limited:OEM:Adoddle   Web::B+:AMS(20280328):1D552CCC04C75155CFF9AA24D77C40C5E6613FDDFF58BD3B95A545DA2A2CC9A07AD4B6F5C7",
    "resourceUploadSizeLimit": 104857600,
    "sequencesEnabled": true,
    "presenterEnabled": true,
    "loginPolicy": undefined,
    "legalTemplates": [{
        "title": "Terms & Conditions",
        "type": "agreeTo",
        "page": "terms",
        "fileName": "legal\u002Fterms.html"
    }, {
        "title": "Privacy",
        "type": "haveRead",
        "page": "privacy",
        "fileName": "legal\u002Fprivacy.html"
    }, {
        "title": "Cookies",
        "type": "haveRead",
        "page": "cookies",
        "fileName": "legal\u002Fcookies.html"
    }],
    "apiURL": "https:\u002F\u002Fstaging.dev.3drepo.io:443\u002Fapi",
    "hotjar": undefined,
    "chatHost": "https:\u002F\u002Fchat.staging.dev.3drepo.io:443",
    "chatPath": "\u002Fchat",
    "chatReconnectionAttempts": 5,
    "VERSION": "5.26.4",
    "backgroundImage": "public\u002Fimages\u002Fdummies\u002Flogin-background.jpg",
    "return_path": "\u002F",
    "auth": {
        "captcha": false,
        "register": true
    },
    "uploadSizeLimit": "1073741824",
    "imageSizeLimit": 1048576,
    "imageExtensions": ["png", "jpg", "jpeg", "gif"],
    "countries": [{
        "name": "Afghanistan",
        "code": "AF"
    }, {
        "name": "Åland Islands",
        "code": "AX"
    }, {
        "name": "Albania",
        "code": "AL"
    }, {
        "name": "Algeria",
        "code": "DZ"
    }, {
        "name": "American Samoa",
        "code": "AS"
    }, {
        "name": "Andorra",
        "code": "AD"
    }, {
        "name": "Angola",
        "code": "AO"
    }, {
        "name": "Anguilla",
        "code": "AI"
    }, {
        "name": "Antarctica",
        "code": "AQ"
    }, {
        "name": "Antigua and Barbuda",
        "code": "AG"
    }, {
        "name": "Argentina",
        "code": "AR"
    }, {
        "name": "Armenia",
        "code": "AM"
    }, {
        "name": "Aruba",
        "code": "AW"
    }, {
        "name": "Australia",
        "code": "AU"
    }, {
        "name": "Austria",
        "code": "AT"
    }, {
        "name": "Azerbaijan",
        "code": "AZ"
    }, {
        "name": "Bahamas",
        "code": "BS"
    }, {
        "name": "Bahrain",
        "code": "BH"
    }, {
        "name": "Bangladesh",
        "code": "BD"
    }, {
        "name": "Barbados",
        "code": "BB"
    }, {
        "name": "Belarus",
        "code": "BY"
    }, {
        "name": "Belgium",
        "code": "BE"
    }, {
        "name": "Belize",
        "code": "BZ"
    }, {
        "name": "Benin",
        "code": "BJ"
    }, {
        "name": "Bermuda",
        "code": "BM"
    }, {
        "name": "Bhutan",
        "code": "BT"
    }, {
        "name": "Bolivia",
        "code": "BO"
    }, {
        "name": "Bosnia and Herzegovina",
        "code": "BA"
    }, {
        "name": "Botswana",
        "code": "BW"
    }, {
        "name": "Bouvet Island",
        "code": "BV"
    }, {
        "name": "Brazil",
        "code": "BR"
    }, {
        "name": "British Indian Ocean Territory",
        "code": "IO"
    }, {
        "name": "Brunei Darussalam",
        "code": "BN"
    }, {
        "name": "Bulgaria",
        "code": "BG"
    }, {
        "name": "Burkina Faso",
        "code": "BF"
    }, {
        "name": "Burundi",
        "code": "BI"
    }, {
        "name": "Cambodia",
        "code": "KH"
    }, {
        "name": "Cameroon",
        "code": "CM"
    }, {
        "name": "Canada",
        "code": "CA"
    }, {
        "name": "Cape Verde",
        "code": "CV"
    }, {
        "name": "Cayman Islands",
        "code": "KY"
    }, {
        "name": "Central African Republic",
        "code": "CF"
    }, {
        "name": "Chad",
        "code": "TD"
    }, {
        "name": "Chile",
        "code": "CL"
    }, {
        "name": "China",
        "code": "CN"
    }, {
        "name": "Christmas Island",
        "code": "CX"
    }, {
        "name": "Cocos (Keeling) Islands",
        "code": "CC"
    }, {
        "name": "Colombia",
        "code": "CO"
    }, {
        "name": "Comoros",
        "code": "KM"
    }, {
        "name": "Congo",
        "code": "CG"
    }, {
        "name": "Congo, The Democratic Republic of the",
        "code": "CD"
    }, {
        "name": "Cook Islands",
        "code": "CK"
    }, {
        "name": "Costa Rica",
        "code": "CR"
    }, {
        "name": "Cote D'Ivoire",
        "code": "CI"
    }, {
        "name": "Croatia",
        "code": "HR"
    }, {
        "name": "Cuba",
        "code": "CU"
    }, {
        "name": "Cyprus",
        "code": "CY"
    }, {
        "name": "Czech Republic",
        "code": "CZ"
    }, {
        "name": "Denmark",
        "code": "DK"
    }, {
        "name": "Djibouti",
        "code": "DJ"
    }, {
        "name": "Dominica",
        "code": "DM"
    }, {
        "name": "Dominican Republic",
        "code": "DO"
    }, {
        "name": "Ecuador",
        "code": "EC"
    }, {
        "name": "Egypt",
        "code": "EG"
    }, {
        "name": "El Salvador",
        "code": "SV"
    }, {
        "name": "Equatorial Guinea",
        "code": "GQ"
    }, {
        "name": "Eritrea",
        "code": "ER"
    }, {
        "name": "Estonia",
        "code": "EE"
    }, {
        "name": "Ethiopia",
        "code": "ET"
    }, {
        "name": "Falkland Islands (Malvinas)",
        "code": "FK"
    }, {
        "name": "Faroe Islands",
        "code": "FO"
    }, {
        "name": "Fiji",
        "code": "FJ"
    }, {
        "name": "Finland",
        "code": "FI"
    }, {
        "name": "France",
        "code": "FR"
    }, {
        "name": "French Guiana",
        "code": "GF"
    }, {
        "name": "French Polynesia",
        "code": "PF"
    }, {
        "name": "French Southern Territories",
        "code": "TF"
    }, {
        "name": "Gabon",
        "code": "GA"
    }, {
        "name": "Gambia",
        "code": "GM"
    }, {
        "name": "Georgia",
        "code": "GE"
    }, {
        "name": "Germany",
        "code": "DE"
    }, {
        "name": "Ghana",
        "code": "GH"
    }, {
        "name": "Gibraltar",
        "code": "GI"
    }, {
        "name": "Greece",
        "code": "GR"
    }, {
        "name": "Greenland",
        "code": "GL"
    }, {
        "name": "Grenada",
        "code": "GD"
    }, {
        "name": "Guadeloupe",
        "code": "GP"
    }, {
        "name": "Guam",
        "code": "GU"
    }, {
        "name": "Guatemala",
        "code": "GT"
    }, {
        "name": "Guernsey",
        "code": "GG"
    }, {
        "name": "Guinea",
        "code": "GN"
    }, {
        "name": "Guinea-Bissau",
        "code": "GW"
    }, {
        "name": "Guyana",
        "code": "GY"
    }, {
        "name": "Haiti",
        "code": "HT"
    }, {
        "name": "Heard Island and Mcdonald Islands",
        "code": "HM"
    }, {
        "name": "Holy See (Vatican City State)",
        "code": "VA"
    }, {
        "name": "Honduras",
        "code": "HN"
    }, {
        "name": "Hong Kong",
        "code": "HK"
    }, {
        "name": "Hungary",
        "code": "HU"
    }, {
        "name": "Iceland",
        "code": "IS"
    }, {
        "name": "India",
        "code": "IN"
    }, {
        "name": "Indonesia",
        "code": "ID"
    }, {
        "name": "Iran, Islamic Republic Of",
        "code": "IR"
    }, {
        "name": "Iraq",
        "code": "IQ"
    }, {
        "name": "Ireland",
        "code": "IE"
    }, {
        "name": "Isle of Man",
        "code": "IM"
    }, {
        "name": "Israel",
        "code": "IL"
    }, {
        "name": "Italy",
        "code": "IT"
    }, {
        "name": "Jamaica",
        "code": "JM"
    }, {
        "name": "Japan",
        "code": "JP"
    }, {
        "name": "Jersey",
        "code": "JE"
    }, {
        "name": "Jordan",
        "code": "JO"
    }, {
        "name": "Kazakhstan",
        "code": "KZ"
    }, {
        "name": "Kenya",
        "code": "KE"
    }, {
        "name": "Kiribati",
        "code": "KI"
    }, {
        "name": "Korea, Democratic People's Republic of",
        "code": "KP"
    }, {
        "name": "Korea, Republic of",
        "code": "KR"
    }, {
        "name": "Kuwait",
        "code": "KW"
    }, {
        "name": "Kyrgyzstan",
        "code": "KG"
    }, {
        "name": "Lao People's Democratic Republic",
        "code": "LA"
    }, {
        "name": "Latvia",
        "code": "LV"
    }, {
        "name": "Lebanon",
        "code": "LB"
    }, {
        "name": "Lesotho",
        "code": "LS"
    }, {
        "name": "Liberia",
        "code": "LR"
    }, {
        "name": "Libyan Arab Jamahiriya",
        "code": "LY"
    }, {
        "name": "Liechtenstein",
        "code": "LI"
    }, {
        "name": "Lithuania",
        "code": "LT"
    }, {
        "name": "Luxembourg",
        "code": "LU"
    }, {
        "name": "Macao",
        "code": "MO"
    }, {
        "name": "Macedonia, The Former Yugoslav Republic of",
        "code": "MK"
    }, {
        "name": "Madagascar",
        "code": "MG"
    }, {
        "name": "Malawi",
        "code": "MW"
    }, {
        "name": "Malaysia",
        "code": "MY"
    }, {
        "name": "Maldives",
        "code": "MV"
    }, {
        "name": "Mali",
        "code": "ML"
    }, {
        "name": "Malta",
        "code": "MT"
    }, {
        "name": "Marshall Islands",
        "code": "MH"
    }, {
        "name": "Martinique",
        "code": "MQ"
    }, {
        "name": "Mauritania",
        "code": "MR"
    }, {
        "name": "Mauritius",
        "code": "MU"
    }, {
        "name": "Mayotte",
        "code": "YT"
    }, {
        "name": "Mexico",
        "code": "MX"
    }, {
        "name": "Micronesia, Federated States of",
        "code": "FM"
    }, {
        "name": "Moldova, Republic of",
        "code": "MD"
    }, {
        "name": "Monaco",
        "code": "MC"
    }, {
        "name": "Mongolia",
        "code": "MN"
    }, {
        "name": "Montserrat",
        "code": "MS"
    }, {
        "name": "Morocco",
        "code": "MA"
    }, {
        "name": "Mozambique",
        "code": "MZ"
    }, {
        "name": "Myanmar",
        "code": "MM"
    }, {
        "name": "Namibia",
        "code": "NA"
    }, {
        "name": "Nauru",
        "code": "NR"
    }, {
        "name": "Nepal",
        "code": "NP"
    }, {
        "name": "Netherlands",
        "code": "NL"
    }, {
        "name": "Netherlands Antilles",
        "code": "AN"
    }, {
        "name": "New Caledonia",
        "code": "NC"
    }, {
        "name": "New Zealand",
        "code": "NZ"
    }, {
        "name": "Nicaragua",
        "code": "NI"
    }, {
        "name": "Niger",
        "code": "NE"
    }, {
        "name": "Nigeria",
        "code": "NG"
    }, {
        "name": "Niue",
        "code": "NU"
    }, {
        "name": "Norfolk Island",
        "code": "NF"
    }, {
        "name": "Northern Mariana Islands",
        "code": "MP"
    }, {
        "name": "Norway",
        "code": "NO"
    }, {
        "name": "Oman",
        "code": "OM"
    }, {
        "name": "Pakistan",
        "code": "PK"
    }, {
        "name": "Palau",
        "code": "PW"
    }, {
        "name": "Palestinian Territory, Occupied",
        "code": "PS"
    }, {
        "name": "Panama",
        "code": "PA"
    }, {
        "name": "Papua New Guinea",
        "code": "PG"
    }, {
        "name": "Paraguay",
        "code": "PY"
    }, {
        "name": "Peru",
        "code": "PE"
    }, {
        "name": "Philippines",
        "code": "PH"
    }, {
        "name": "Pitcairn",
        "code": "PN"
    }, {
        "name": "Poland",
        "code": "PL"
    }, {
        "name": "Portugal",
        "code": "PT"
    }, {
        "name": "Puerto Rico",
        "code": "PR"
    }, {
        "name": "Qatar",
        "code": "QA"
    }, {
        "name": "Reunion",
        "code": "RE"
    }, {
        "name": "Romania",
        "code": "RO"
    }, {
        "name": "Russian Federation",
        "code": "RU"
    }, {
        "name": "RWANDA",
        "code": "RW"
    }, {
        "name": "Saint Helena",
        "code": "SH"
    }, {
        "name": "Saint Kitts and Nevis",
        "code": "KN"
    }, {
        "name": "Saint Lucia",
        "code": "LC"
    }, {
        "name": "Saint Pierre and Miquelon",
        "code": "PM"
    }, {
        "name": "Saint Vincent and the Grenadines",
        "code": "VC"
    }, {
        "name": "Samoa",
        "code": "WS"
    }, {
        "name": "San Marino",
        "code": "SM"
    }, {
        "name": "Sao Tome and Principe",
        "code": "ST"
    }, {
        "name": "Saudi Arabia",
        "code": "SA"
    }, {
        "name": "Senegal",
        "code": "SN"
    }, {
        "name": "Serbia and Montenegro",
        "code": "CS"
    }, {
        "name": "Seychelles",
        "code": "SC"
    }, {
        "name": "Sierra Leone",
        "code": "SL"
    }, {
        "name": "Singapore",
        "code": "SG"
    }, {
        "name": "Slovakia",
        "code": "SK"
    }, {
        "name": "Slovenia",
        "code": "SI"
    }, {
        "name": "Solomon Islands",
        "code": "SB"
    }, {
        "name": "Somalia",
        "code": "SO"
    }, {
        "name": "South Africa",
        "code": "ZA"
    }, {
        "name": "South Georgia and the South Sandwich Islands",
        "code": "GS"
    }, {
        "name": "Spain",
        "code": "ES"
    }, {
        "name": "Sri Lanka",
        "code": "LK"
    }, {
        "name": "Sudan",
        "code": "SD"
    }, {
        "name": "Suriname",
        "code": "SR"
    }, {
        "name": "Svalbard and Jan Mayen",
        "code": "SJ"
    }, {
        "name": "Swaziland",
        "code": "SZ"
    }, {
        "name": "Sweden",
        "code": "SE"
    }, {
        "name": "Switzerland",
        "code": "CH"
    }, {
        "name": "Syrian Arab Republic",
        "code": "SY"
    }, {
        "name": "Taiwan, Province of China",
        "code": "TW"
    }, {
        "name": "Tajikistan",
        "code": "TJ"
    }, {
        "name": "Tanzania, United Republic of",
        "code": "TZ"
    }, {
        "name": "Thailand",
        "code": "TH"
    }, {
        "name": "Timor-Leste",
        "code": "TL"
    }, {
        "name": "Togo",
        "code": "TG"
    }, {
        "name": "Tokelau",
        "code": "TK"
    }, {
        "name": "Tonga",
        "code": "TO"
    }, {
        "name": "Trinidad and Tobago",
        "code": "TT"
    }, {
        "name": "Tunisia",
        "code": "TN"
    }, {
        "name": "Turkey",
        "code": "TR"
    }, {
        "name": "Turkmenistan",
        "code": "TM"
    }, {
        "name": "Turks and Caicos Islands",
        "code": "TC"
    }, {
        "name": "Tuvalu",
        "code": "TV"
    }, {
        "name": "Uganda",
        "code": "UG"
    }, {
        "name": "Ukraine",
        "code": "UA"
    }, {
        "name": "United Arab Emirates",
        "code": "AE"
    }, {
        "name": "United Kingdom",
        "code": "GB"
    }, {
        "name": "United States",
        "code": "US"
    }, {
        "name": "United States Minor Outlying Islands",
        "code": "UM"
    }, {
        "name": "Uruguay",
        "code": "UY"
    }, {
        "name": "Uzbekistan",
        "code": "UZ"
    }, {
        "name": "Vanuatu",
        "code": "VU"
    }, {
        "name": "Venezuela",
        "code": "VE"
    }, {
        "name": "Viet Nam",
        "code": "VN"
    }, {
        "name": "Virgin Islands, British",
        "code": "VG"
    }, {
        "name": "Virgin Islands, U.S.",
        "code": "VI"
    }, {
        "name": "Wallis and Futuna",
        "code": "WF"
    }, {
        "name": "Western Sahara",
        "code": "EH"
    }, {
        "name": "Yemen",
        "code": "YE"
    }, {
        "name": "Zambia",
        "code": "ZM"
    }, {
        "name": "Zimbabwe",
        "code": "ZW"
    }],
    "euCountriesCode": ["GB", "BE", "BG", "CZ", "DK", "DE", "EE", "IE", "GR", "ES", "FR", "HR", "IT", "CY", "LV", "LT", "LU", "HU", "MT", "NL", "AT", "PL", "PT", "RO", "SI", "SK", "FI", "SE"],
    "usStates": [{
        "name": "Alabama",
        "code": "AL"
    }, {
        "name": "Alaska",
        "code": "AK"
    }, {
        "name": "American Samoa",
        "code": "AS"
    }, {
        "name": "Arizona",
        "code": "AZ"
    }, {
        "name": "Arkansas",
        "code": "AR"
    }, {
        "name": "California",
        "code": "CA"
    }, {
        "name": "Colorado",
        "code": "CO"
    }, {
        "name": "Connecticut",
        "code": "CT"
    }, {
        "name": "Delaware",
        "code": "DE"
    }, {
        "name": "District Of Columbia",
        "code": "DC"
    }, {
        "name": "Federated States Of Micronesia",
        "code": "FM"
    }, {
        "name": "Florida",
        "code": "FL"
    }, {
        "name": "Georgia",
        "code": "GA"
    }, {
        "name": "Guam",
        "code": "GU"
    }, {
        "name": "Hawaii",
        "code": "HI"
    }, {
        "name": "Idaho",
        "code": "ID"
    }, {
        "name": "Illinois",
        "code": "IL"
    }, {
        "name": "Indiana",
        "code": "IN"
    }, {
        "name": "Iowa",
        "code": "IA"
    }, {
        "name": "Kansas",
        "code": "KS"
    }, {
        "name": "Kentucky",
        "code": "KY"
    }, {
        "name": "Louisiana",
        "code": "LA"
    }, {
        "name": "Maine",
        "code": "ME"
    }, {
        "name": "Marshall Islands",
        "code": "MH"
    }, {
        "name": "Maryland",
        "code": "MD"
    }, {
        "name": "Massachusetts",
        "code": "MA"
    }, {
        "name": "Michigan",
        "code": "MI"
    }, {
        "name": "Minnesota",
        "code": "MN"
    }, {
        "name": "Mississippi",
        "code": "MS"
    }, {
        "name": "Missouri",
        "code": "MO"
    }, {
        "name": "Montana",
        "code": "MT"
    }, {
        "name": "Nebraska",
        "code": "NE"
    }, {
        "name": "Nevada",
        "code": "NV"
    }, {
        "name": "New Hampshire",
        "code": "NH"
    }, {
        "name": "New Jersey",
        "code": "NJ"
    }, {
        "name": "New Mexico",
        "code": "NM"
    }, {
        "name": "New York",
        "code": "NY"
    }, {
        "name": "North Carolina",
        "code": "NC"
    }, {
        "name": "North Dakota",
        "code": "ND"
    }, {
        "name": "Northern Mariana Islands",
        "code": "MP"
    }, {
        "name": "Ohio",
        "code": "OH"
    }, {
        "name": "Oklahoma",
        "code": "OK"
    }, {
        "name": "Oregon",
        "code": "OR"
    }, {
        "name": "Palau",
        "code": "PW"
    }, {
        "name": "Pennsylvania",
        "code": "PA"
    }, {
        "name": "Puerto Rico",
        "code": "PR"
    }, {
        "name": "Rhode Island",
        "code": "RI"
    }, {
        "name": "South Carolina",
        "code": "SC"
    }, {
        "name": "South Dakota",
        "code": "SD"
    }, {
        "name": "Tennessee",
        "code": "TN"
    }, {
        "name": "Texas",
        "code": "TX"
    }, {
        "name": "Utah",
        "code": "UT"
    }, {
        "name": "Vermont",
        "code": "VT"
    }, {
        "name": "Virgin Islands",
        "code": "VI"
    }, {
        "name": "Virginia",
        "code": "VA"
    }, {
        "name": "Washington",
        "code": "WA"
    }, {
        "name": "West Virginia",
        "code": "WV"
    }, {
        "name": "Wisconsin",
        "code": "WI"
    }, {
        "name": "Wyoming",
        "code": "WY"
    }],
    "units": [{
        "value": "mm",
        "name": "Millimetres"
    }, {
        "value": "cm",
        "name": "Centimetres"
    }, {
        "value": "dm",
        "name": "Decimetres"
    }, {
        "value": "m",
        "name": "Metres"
    }, {
        "value": "ft",
        "name": "Feet and inches"
    }],
    "legal": [{
        "title": "Terms & Conditions",
        "type": "agreeTo",
        "page": "terms",
        "fileName": "legal\u002Fterms.html"
    }, {
        "title": "Privacy",
        "type": "haveRead",
        "page": "privacy",
        "fileName": "legal\u002Fprivacy.html"
    }, {
        "title": "Cookies",
        "type": "haveRead",
        "page": "cookies",
        "fileName": "legal\u002Fcookies.html"
    }],
    "tagRegExp": new RegExp("^[a-zA-Z0-9_-]{1,50}$",""),
    "modelNameRegExp": undefined,
    "fileNameRegExp": new RegExp("[ *\"\u002F\\\\[\\]:;|=,\u003C\u003E$]","g"),
    "usernameRegExp": new RegExp("^[a-zA-Z][\\w]{1,63}$",""),
    "acceptedFormat": ["x", "obj", "3ds", "md3", "md2", "ply", "mdl", "ase", "hmp", "smd", "mdc", "md5", "stl", "lxo", "nff", "raw", "off", "ac", "bvh", "irrmesh", "irr", "q3d", "q3s", "b3d", "dae", "ter", "csm", "3d", "lws", "xml", "ogex", "ms3d", "cob", "scn", "blend", "pk3", "ndo", "ifc", "xgl", "zgl", "fbx", "assbin", "bim", "dgn", "rvt", "rfa", "spm", "dwg", "dxf", "nwd", "nwc"],
    "login_check_interval": 8,
    "responseCodes": {
        "OK": {
            "message": "OK",
            "status": 200,
            "code": "OK",
            "value": 0
        },
        "USER_NOT_FOUND": {
            "message": "User not found",
            "status": 404,
            "code": "USER_NOT_FOUND",
            "value": 1
        },
        "INCORRECT_USERNAME_OR_PASSWORD": {
            "message": "Incorrect username or password",
            "status": 400,
            "code": "INCORRECT_USERNAME_OR_PASSWORD",
            "value": 2
        },
        "CAN_ONLY_CHANGE_OWN_ACCOUNT": {
            "message": "You can only update your own account",
            "status": 401,
            "code": "CAN_ONLY_CHANGE_OWN_ACCOUNT",
            "value": 3
        },
        "NOT_LOGGED_IN": {
            "message": "You are not logged in",
            "status": 401,
            "code": "NOT_LOGGED_IN",
            "value": 4
        },
        "AUTH_ERROR": {
            "message": "Authentication error",
            "status": 401,
            "code": "AUTH_ERROR",
            "value": 5
        },
        "USERNAME_NOT_SPECIFIED": {
            "message": "Username not specifed",
            "status": 422,
            "code": "USERNAME_NOT_SPECIFIED",
            "value": 6
        },
        "MODEL_NOT_SPECIFIED": {
            "message": "Model not specifed",
            "status": 422,
            "code": "MODEL_NOT_SPECIFIED",
            "value": 7
        },
        "MODEL_NOT_PUBLIC": {
            "message": "Not a public model",
            "status": 401,
            "code": "MODEL_NOT_PUBLIC",
            "value": 8
        },
        "NOT_AUTHORIZED": {
            "message": "Not Authorized",
            "status": 401,
            "code": "NOT_AUTHORIZED",
            "value": 9
        },
        "INVALID_ARGUMENTS": {
            "message": "Missing or invalid arguments",
            "status": 400,
            "code": "INVALID_ARGUMENTS",
            "value": 10
        },
        "INVALID_DATE_ORDER": {
            "message": "Start date does not precede end date",
            "status": 400,
            "code": "INVALID_DATE_ORDER",
            "value": 11
        },
        "RID_SID_OR_UID_NOT_SPECIFIED": {
            "message": "RID, SID or UID not specified",
            "status": 422,
            "code": "RID_SID_OR_UID_NOT_SPECIFIED",
            "value": 12
        },
        "GET_PUBLIC_NOT_SPECIFIED": {
            "message": "Get public parameter not specified",
            "status": 422,
            "code": "GET_PUBLIC_NOT_SPECIFIED",
            "value": 13
        },
        "OBJECT_TYPE_NOT_SUPPORTED": {
            "message": "Object type not supported",
            "status": 500,
            "code": "OBJECT_TYPE_NOT_SUPPORTED",
            "value": 14
        },
        "USER_DOES_NOT_HAVE_AVATAR": {
            "message": "User does not have an avatar",
            "status": 404,
            "code": "USER_DOES_NOT_HAVE_AVATAR",
            "value": 15
        },
        "AVATAR_IS_NOT_AN_IMAGE": {
            "message": "Avatar is not an image",
            "status": 500,
            "code": "AVATAR_IS_NOT_AN_IMAGE",
            "value": 16
        },
        "AVATAR_IS_NOT_A_JPEG": {
            "message": "Avatar is not a JPEG",
            "status": 500,
            "code": "AVATAR_IS_NOT_A_JPEG",
            "value": 17
        },
        "FORMAT_NOT_SUPPORTED": {
            "message": "Format not supported for this regex",
            "status": 415,
            "code": "FORMAT_NOT_SUPPORTED",
            "value": 18
        },
        "FUNCTION_NOT_SUPPORTED": {
            "message": "REST API call not supported",
            "status": 501,
            "code": "FUNCTION_NOT_SUPPORTED",
            "value": 19
        },
        "INVALID_INPUTS_TO_PASSWORD_UPDATE": {
            "message": "Invalid new or old password",
            "status": 422,
            "code": "INVALID_INPUTS_TO_PASSWORD_UPDATE",
            "value": 20
        },
        "MODEL_INFO_NOT_FOUND": {
            "message": "Model info not found",
            "status": 404,
            "code": "MODEL_INFO_NOT_FOUND",
            "value": 21
        },
        "BRANCH_NOT_FOUND": {
            "message": "Branch not found",
            "status": 404,
            "code": "BRANCH_NOT_FOUND",
            "value": 22
        },
        "ERROR_RENDERING_OBJECT": {
            "message": "Error rendering object",
            "status": 500,
            "code": "ERROR_RENDERING_OBJECT",
            "value": 23
        },
        "MISSING_SCHEMA": {
            "message": "Trying to process request with missing schema",
            "status": 500,
            "code": "MISSING_SCHEMA",
            "value": 24
        },
        "SETTINGS_ERROR": {
            "message": "Error in the settings collection",
            "status": 500,
            "code": "SETTINGS_ERROR",
            "value": 25
        },
        "OBJECT_NOT_FOUND": {
            "message": "Object not found",
            "status": 404,
            "code": "OBJECT_NOT_FOUND",
            "value": 26
        },
        "ROOT_NODE_NOT_FOUND": {
            "message": "No root node found for revision",
            "status": 500,
            "code": "ROOT_NODE_NOT_FOUND",
            "value": 27
        },
        "ISSUE_NOT_FOUND": {
            "message": "Issue not found",
            "status": 404,
            "code": "ISSUE_NOT_FOUND",
            "value": 28
        },
        "HEAD_REVISION_NOT_FOUND": {
            "message": "Head revision not found",
            "status": 404,
            "code": "HEAD_REVISION_NOT_FOUND",
            "value": 29
        },
        "FILE_IMPORT_PROCESS_ERR": {
            "message": "Import failed: Failed to process file",
            "status": 400,
            "code": "FILE_IMPORT_PROCESS_ERR",
            "value": 30
        },
        "FILE_IMPORT_UNKNOWN_ERR": {
            "message": "Import failed: Unknown error",
            "status": 500,
            "code": "FILE_IMPORT_UNKNOWN_ERR",
            "value": 31
        },
        "FILE_IMPORT_MISSING_TEXTURES": {
            "message": "Imported but missing textures",
            "status": 400,
            "code": "FILE_IMPORT_MISSING_TEXTURES",
            "value": 32
        },
        "FILE_IMPORT_MISSING_NODES": {
            "message": "Imported but missing nodes (corrupted file?)",
            "status": 400,
            "code": "FILE_IMPORT_MISSING_NODES",
            "value": 33
        },
        "FILE_IMPORT_STASH_GEN_FAILED": {
            "message": "Failed to regenerate stash: Unknown error",
            "status": 500,
            "code": "FILE_IMPORT_STASH_GEN_FAILED",
            "value": 34
        },
        "FILE_IMPORT_BUNDLE_GEN_FAILED": {
            "message": "Import failed: Failed to generate unity files",
            "status": 500,
            "code": "FILE_IMPORT_BUNDLE_GEN_FAILED",
            "value": 35
        },
        "FILE_IMPORT_LOAD_SCENE_INVALID_MESHES": {
            "message": "Import failed: Untriangulated meshes",
            "status": 400,
            "code": "FILE_IMPORT_LOAD_SCENE_INVALID_MESHES",
            "value": 36
        },
        "FILE_IMPORT_NO_MESHES": {
            "message": "Import failed: Model does not have geometry",
            "status": 400,
            "code": "FILE_IMPORT_NO_MESHES",
            "value": 37
        },
        "FILE_IMPORT_BAD_EXT": {
            "message": "Import failed: Unsupported file type",
            "status": 400,
            "code": "FILE_IMPORT_BAD_EXT",
            "value": 38
        },
        "FILE_IMPORT_UNSUPPORTED_VERSION_BIM": {
            "message": "Import failed: Unsupported plugin version",
            "status": 400,
            "code": "FILE_IMPORT_UNSUPPORTED_VERSION_BIM",
            "value": 39
        },
        "FILE_IMPORT_UNSUPPORTED_VERSION_FBX": {
            "message": "Import failed: Unsupported FBX version (Supported: 2011, 2012, 2013)",
            "status": 400,
            "code": "FILE_IMPORT_UNSUPPORTED_VERSION_FBX",
            "value": 40
        },
        "FILE_IMPORT_UNSUPPORTED_VERSION": {
            "message": "Unsupported file version",
            "status": 400,
            "code": "FILE_IMPORT_UNSUPPORTED_VERSION",
            "value": 41
        },
        "FILE_IMPORT_MAX_NODES_EXCEEDED": {
            "message": "Import failed: Too many objects, consider splitting up the model",
            "status": 400,
            "code": "FILE_IMPORT_MAX_NODES_EXCEEDED",
            "value": 42
        },
        "FILE_IMPORT_ODA_NOT_SUPPORTED": {
            "message": "DGN\u002FRVT import is currently not supported",
            "status": 400,
            "code": "FILE_IMPORT_ODA_NOT_SUPPORTED",
            "value": 43
        },
        "FILE_IMPORT_SYNCHRO_NOT_SUPPORTED": {
            "message": "SPM import is currently not supported",
            "status": 400,
            "code": "FILE_IMPORT_SYNCHRO_NOT_SUPPORTED",
            "value": 44
        },
        "FILE_IMPORT_NO_3D_VIEW": {
            "message": "Cannot find a 3D View within the model.",
            "status": 400,
            "code": "FILE_IMPORT_NO_3D_VIEW",
            "value": 45
        },
        "FILE_IMPORT_TIMED_OUT": {
            "message": "Process timed out. Consider splitting up the model",
            "status": 500,
            "code": "FILE_IMPORT_TIMED_OUT",
            "value": 46
        },
        "FILE_IMPORT_GEOMETRY_ERR": {
            "message": "File contains geometry that are not polylines\u002Ftriangles",
            "status": 400,
            "code": "FILE_IMPORT_GEOMETRY_ERR",
            "value": 47
        },
        "QUEUE_CONN_ERR": {
            "message": "Failed to queue your request. Please try again later.",
            "status": 500,
            "code": "QUEUE_CONN_ERR",
            "value": 48
        },
        "QUEUE_NO_CONFIG": {
            "message": "Server has no queue configuration",
            "status": 500,
            "code": "QUEUE_NO_CONFIG",
            "value": 49
        },
        "INVALID_MESH": {
            "message": "Mesh not valid for processing",
            "status": 500,
            "code": "INVALID_MESH",
            "value": 50
        },
        "FILE_ALREADY_EXISTS": {
            "message": "File already exists",
            "status": 500,
            "code": "FILE_ALREADY_EXISTS",
            "value": 51
        },
        "FILE_DOESNT_EXIST": {
            "message": "File doesn't exist",
            "status": 404,
            "code": "FILE_DOESNT_EXIST",
            "value": 52
        },
        "AVATAR_INVALID_IMAGE_TYPE": {
            "message": "Avatar does not have valid image type",
            "status": 500,
            "code": "AVATAR_INVALID_IMAGE_TYPE",
            "value": 53
        },
        "IMAGE_CONVERSION_FAILED": {
            "message": "Image conversion failed",
            "status": 500,
            "code": "IMAGE_CONVERSION_FAILED",
            "value": 54
        },
        "ROLE_SETTINGS_NOT_FOUND": {
            "message": "Role settings not found",
            "status": 500,
            "code": "ROLE_SETTINGS_NOT_FOUND",
            "value": 55
        },
        "GROUP_NOT_FOUND": {
            "message": "Group not found",
            "status": 404,
            "code": "GROUP_NOT_FOUND",
            "value": 56
        },
        "INVALID_GROUP": {
            "message": "Group request malformed",
            "status": 400,
            "code": "INVALID_GROUP",
            "value": 57
        },
        "MULTIPLE_RULES_PER_FIELD_NOT_ALLOWED": {
            "message": "Only one rule allowed per field",
            "status": 400,
            "code": "MULTIPLE_RULES_PER_FIELD_NOT_ALLOWED",
            "value": 58
        },
        "VIEW_NOT_FOUND": {
            "message": "Camera viewpoint not found",
            "status": 404,
            "code": "VIEW_NOT_FOUND",
            "value": 59
        },
        "CANNOT_DELETE_DEFAULT_VIEW": {
            "message": "This view is set to be the default for the model. Please change it before deleting.",
            "status": 400,
            "code": "CANNOT_DELETE_DEFAULT_VIEW",
            "value": 60
        },
        "ACTIVITY_NOT_FOUND": {
            "message": "Activity not found",
            "status": 404,
            "code": "ACTIVITY_NOT_FOUND",
            "value": 61
        },
        "SEQUENCE_NOT_FOUND": {
            "message": "Sequence not found",
            "status": 404,
            "code": "SEQUENCE_NOT_FOUND",
            "value": 62
        },
        "SEQUENCE_READ_ONLY": {
            "message": "Sequence not found",
            "status": 400,
            "code": "SEQUENCE_READ_ONLY",
            "value": 63
        },
        "TASK_NOT_FOUND": {
            "message": "Sequence task not found",
            "status": 404,
            "code": "TASK_NOT_FOUND",
            "value": 64
        },
        "USER_EXISTS": {
            "message": "User already exists",
            "status": 400,
            "code": "USER_EXISTS",
            "value": 65
        },
        "OWNER_MUST_BE_ADMIN": {
            "message": "Cannot alter permissions of teamspace owner",
            "status": 400,
            "code": "OWNER_MUST_BE_ADMIN",
            "value": 66
        },
        "SIGN_UP_PASSWORD_MISSING": {
            "message": "Password is missing",
            "status": 400,
            "code": "SIGN_UP_PASSWORD_MISSING",
            "value": 67
        },
        "PASSWORD_TOO_SHORT": {
            "message": "Password is too short",
            "status": 400,
            "code": "PASSWORD_TOO_SHORT",
            "value": 68
        },
        "PASSWORD_TOO_WEAK": {
            "message": "Password is too weak",
            "status": 400,
            "code": "PASSWORD_TOO_WEAK",
            "value": 69
        },
        "TOKEN_INVALID": {
            "message": "Token is invalid or expired",
            "status": 400,
            "code": "TOKEN_INVALID",
            "value": 70
        },
        "ALREADY_VERIFIED": {
            "message": "Already verified",
            "status": 400,
            "code": "ALREADY_VERIFIED",
            "value": 71
        },
        "USER_NOT_VERIFIED": {
            "message": "Account not yet verified. Please check your email.",
            "status": 400,
            "code": "USER_NOT_VERIFIED",
            "value": 72
        },
        "INVALID_CAPTCHA_RES": {
            "message": "Invalid captcha",
            "status": 400,
            "code": "INVALID_CAPTCHA_RES",
            "value": 73
        },
        "REGISTER_DISABLE": {
            "message": "Sign up function is disabled",
            "status": 400,
            "code": "REGISTER_DISABLE",
            "value": 74
        },
        "MODEL_EXIST": {
            "message": "Model already exists with that name",
            "status": 400,
            "code": "MODEL_EXIST",
            "value": 75
        },
        "PROJECT_EXIST": {
            "message": "Project already exists",
            "status": 400,
            "code": "PROJECT_EXIST",
            "value": 76
        },
        "DATABASE_EXIST": {
            "message": "Database already exists",
            "status": 400,
            "code": "DATABASE_EXIST",
            "value": 77
        },
        "TOO_MANY_LOGIN_ATTEMPTS": {
            "message": "Too many unsuccessful login attempts! Account locked",
            "status": 400,
            "code": "TOO_MANY_LOGIN_ATTEMPTS",
            "value": 78
        },
        "ACCOUNT_LOGIN_LOCKED": {
            "message": "Account locked. Please try again later",
            "status": 400,
            "code": "ACCOUNT_LOGIN_LOCKED",
            "value": 79
        },
        "SIZE_LIMIT_PAY": {
            "message": "Teamspace quota exceeded.",
            "status": 400,
            "code": "SIZE_LIMIT_PAY",
            "value": 80
        },
        "INVALID_SUBSCRIPTION_PLAN": {
            "message": "Invalid subscription plan",
            "status": 400,
            "code": "INVALID_SUBSCRIPTION_PLAN",
            "value": 81
        },
        "HERE_MAPS_NOT_AVAILABLE": {
            "message": "Your account does not have a licence for Here Maps",
            "status": 400,
            "code": "HERE_MAPS_NOT_AVAILABLE",
            "value": 82
        },
        "MISSING_HERE_CONFIG": {
            "message": "Here Maps not configured. Please contact support@3drepo.com",
            "status": 500,
            "code": "MISSING_HERE_CONFIG",
            "value": 83
        },
        "FILE_FORMAT_NOT_SUPPORTED": {
            "message": "Format not supported",
            "status": 400,
            "code": "FILE_FORMAT_NOT_SUPPORTED",
            "value": 84
        },
        "SIZE_LIMIT": {
            "message": "Single file size exceeded system limit",
            "status": 400,
            "code": "SIZE_LIMIT",
            "value": 85
        },
        "INVALID_PROJECT_NAME": {
            "message": "Invalid project name",
            "status": 400,
            "code": "INVALID_PROJECT_NAME",
            "value": 86
        },
        "INVALID_PROJECT_ID": {
            "message": "Invalid project id",
            "status": 400,
            "code": "INVALID_PROJECT_ID",
            "value": 87
        },
        "INVALID_MODEL_NAME": {
            "message": "Invalid model name",
            "status": 400,
            "code": "INVALID_MODEL_NAME",
            "value": 88
        },
        "INVALID_MODEL_ID": {
            "message": "Invalid model id",
            "status": 400,
            "code": "INVALID_MODEL_ID",
            "value": 89
        },
        "INVALID_MODEL_PERMISSION": {
            "message": "Invalid model permission role",
            "status": 400,
            "code": "INVALID_MODEL_PERMISSION",
            "value": 90
        },
        "EMAIL_INVALID": {
            "message": "Invalid email address",
            "status": 400,
            "code": "EMAIL_INVALID",
            "value": 91
        },
        "ALREADY_LOGGED_IN": {
            "message": "You are already logged in",
            "status": 400,
            "code": "ALREADY_LOGGED_IN",
            "value": 92
        },
        "VALID_COOKIE": {
            "message": "Your cookie is still valid",
            "status": 200,
            "code": "VALID_COOKIE",
            "value": 93
        },
        "INVALID_COOKIE": {
            "message": "Your cookie has expired",
            "status": 401,
            "code": "INVALID_COOKIE",
            "value": 94
        },
        "STASH_NOT_FOUND": {
            "message": "Stash not found",
            "status": 500,
            "code": "STASH_NOT_FOUND",
            "value": 95
        },
        "ISSUE_NO_NAME": {
            "message": "Create issue without name",
            "status": 400,
            "code": "ISSUE_NO_NAME",
            "value": 96
        },
        "ISSUE_COMMENT_NO_TEXT": {
            "message": "Cannot create comment with no text",
            "status": 400,
            "code": "ISSUE_COMMENT_NO_TEXT",
            "value": 97
        },
        "ISSUE_COMMENT_INVALID_GUID": {
            "message": "Invalid comment guid",
            "status": 400,
            "code": "ISSUE_COMMENT_INVALID_GUID",
            "value": 98
        },
        "ISSUE_COMMENT_PERMISSION_DECLINED": {
            "message": "Can't edit comment made by others",
            "status": 400,
            "code": "ISSUE_COMMENT_PERMISSION_DECLINED",
            "value": 99
        },
        "ISSUE_COMMENT_SEALED": {
            "message": "Can't edit a sealed comment or a comment in closed issue",
            "status": 400,
            "code": "ISSUE_COMMENT_SEALED",
            "value": 100
        },
        "ISSUE_CLOSED_ALREADY": {
            "message": "Issue closed already",
            "status": 400,
            "code": "ISSUE_CLOSED_ALREADY",
            "value": 101
        },
        "PROJECT_NOT_FOUND": {
            "message": "Project not found",
            "status": 404,
            "code": "PROJECT_NOT_FOUND",
            "value": 102
        },
        "NOT_IN_ROLE": {
            "message": "User or role not found",
            "status": 400,
            "code": "NOT_IN_ROLE",
            "value": 103
        },
        "RESOURCE_NOT_FOUND": {
            "message": "Resource not found",
            "status": 404,
            "code": "RESOURCE_NOT_FOUND",
            "value": 104
        },
        "MODEL_NOT_FOUND": {
            "message": "Model not found",
            "status": 404,
            "code": "MODEL_NOT_FOUND",
            "value": 105
        },
        "CORRELATION_ID_NOT_FOUND": {
            "message": "Correlation ID not found",
            "status": 404,
            "code": "CORRELATION_ID_NOT_FOUND",
            "value": 106
        },
        "INVALID_ROLE": {
            "message": "Invalid role name",
            "status": 400,
            "code": "INVALID_ROLE",
            "value": 107
        },
        "ALREADY_IN_ROLE": {
            "message": "User already assigned with this role",
            "status": 400,
            "code": "ALREADY_IN_ROLE",
            "value": 108
        },
        "RESOURCE_NOT_ATTACHED": {
            "message": "The resource is not attached to that particular entity",
            "status": 400,
            "code": "RESOURCE_NOT_ATTACHED",
            "value": 109
        },
        "EMAIL_EXISTS": {
            "message": "Email already exists",
            "status": 400,
            "code": "EMAIL_EXISTS",
            "value": 110
        },
        "COLLABORATOR_LIMIT_EXCEEDED": {
            "message": "You do not have enough quota to add an extra collaborator",
            "status": 400,
            "code": "COLLABORATOR_LIMIT_EXCEEDED",
            "value": 111
        },
        "LICENSE_NO_CHANGE": {
            "message": "You must increase your number of licenses",
            "status": 400,
            "code": "LICENSE_NO_CHANGE",
            "value": 112
        },
        "PLAN_NOT_FOUND": {
            "message": "Plan not found",
            "status": 404,
            "code": "PLAN_NOT_FOUND",
            "value": 113
        },
        "SUBSCRIPTION_NOT_FOUND": {
            "message": "Subscription not found",
            "status": 404,
            "code": "SUBSCRIPTION_NOT_FOUND",
            "value": 114
        },
        "SUBSCRIPTION_ALREADY_ASSIGNED": {
            "message": "Subscription already assigned to someone else",
            "status": 400,
            "code": "SUBSCRIPTION_ALREADY_ASSIGNED",
            "value": 115
        },
        "USER_ALREADY_ASSIGNED": {
            "message": "This user is already in another subscription",
            "status": 400,
            "code": "USER_ALREADY_ASSIGNED",
            "value": 116
        },
        "USER_NOT_ASSIGNED_WITH_LICENSE": {
            "message": "This user is not assigned with license",
            "status": 400,
            "code": "USER_NOT_ASSIGNED_WITH_LICENSE",
            "value": 117
        },
        "SUBSCRIPTION_NOT_ASSIGNED": {
            "message": "This subscription is not assigned to any user",
            "status": 400,
            "code": "SUBSCRIPTION_NOT_ASSIGNED",
            "value": 118
        },
        "USER_IN_COLLABORATOR_LIST": {
            "message": "This user is currently in collaborator list of a model",
            "status": 400,
            "code": "USER_IN_COLLABORATOR_LIST",
            "value": 119
        },
        "SUBSCRIPTION_CANNOT_REMOVE_SELF": {
            "message": "You cannot remove yourself",
            "status": 400,
            "code": "SUBSCRIPTION_CANNOT_REMOVE_SELF",
            "value": 120
        },
        "USER_NOT_ASSIGNED_JOB": {
            "message": "Job must be assigned to user",
            "status": 400,
            "code": "USER_NOT_ASSIGNED_JOB",
            "value": 121
        },
        "USER_ALREADY_EXISTS": {
            "message": "User already exists",
            "status": 400,
            "code": "USER_ALREADY_EXISTS",
            "value": 122
        },
        "PAYMENT_TOKEN_ERROR": {
            "message": "Payment token is invalid",
            "status": 400,
            "code": "PAYMENT_TOKEN_ERROR",
            "value": 123
        },
        "EXECUTE_AGREEMENT_ERROR": {
            "message": "Failed to get payment from PayPal",
            "status": 400,
            "code": "EXECUTE_AGREEMENT_ERROR",
            "value": 124
        },
        "LICENCE_REMOVAL_SPACE_EXCEEDED": {
            "message": "Your current quota usage exceeds the requested change.",
            "status": 400,
            "code": "LICENCE_REMOVAL_SPACE_EXCEEDED",
            "value": 125
        },
        "REMOVE_ASSIGNED_LICENCE": {
            "message": "Some of the licences are assigned and can\"t be removed",
            "status": 400,
            "code": "REMOVE_ASSIGNED_LICENCE",
            "value": 126
        },
        "LICENCE_LIMIT_REACHED": {
            "message": "All licenses have been assigned",
            "status": 400,
            "code": "LICENCE_LIMIT_REACHED",
            "value": 127
        },
        "BILLING_NOT_FOUND": {
            "message": "Billing not found",
            "status": 404,
            "code": "BILLING_NOT_FOUND",
            "value": 128
        },
        "PAYPAL_ERROR": {
            "status": 400,
            "code": "PAYPAL_ERROR",
            "value": 129
        },
        "NO_FILE_FOUND": {
            "message": "No file can be downloaded",
            "status": 404,
            "code": "NO_FILE_FOUND",
            "value": 130
        },
        "MODEL_NO_UNIT": {
            "status": 400,
            "message": "Unit is not specified",
            "code": "MODEL_NO_UNIT",
            "value": 131
        },
        "TREE_NOT_FOUND": {
            "message": "Model fulltree not found in stash",
            "status": 404,
            "code": "TREE_NOT_FOUND",
            "value": 132
        },
        "REPOERR_FED_GEN_FAIL": {
            "message": "Failed to create federation",
            "status": 400,
            "code": "REPOERR_FED_GEN_FAIL",
            "value": 133
        },
        "INVALID_VAT": {
            "status": 400,
            "message": "Invalid VAT number",
            "code": "INVALID_VAT",
            "value": 134
        },
        "NO_CONTACT_EMAIL": {
            "status": 400,
            "message": "contact.email is not defined in config",
            "code": "NO_CONTACT_EMAIL",
            "value": 135
        },
        "DUPLICATE_TAG": {
            "status": 400,
            "message": "Revision name already exists",
            "code": "DUPLICATE_TAG",
            "value": 136
        },
        "INVALID_TAG_NAME": {
            "value": 137,
            "status": 400,
            "message": "Invalid revision name",
            "code": "INVALID_TAG_NAME"
        },
        "FED_MODEL_IN_OTHER_DB": {
            "message": "Models of federation must reside in the same account",
            "status": 400,
            "code": "FED_MODEL_IN_OTHER_DB",
            "value": 138
        },
        "FED_MODEL_IS_A_FED": {
            "message": "Models of federation cannot be a federation",
            "status": 400,
            "code": "FED_MODEL_IS_A_FED",
            "value": 139
        },
        "MODEL_IS_NOT_A_FED": {
            "message": "Model is not a federation",
            "status": 400,
            "code": "MODEL_IS_NOT_A_FED",
            "value": 140
        },
        "MODEL_IS_A_SUBMODEL": {
            "message": "Model cannot be deleted as it is currently a sub model of another federation",
            "status": 400,
            "code": "MODEL_IS_A_SUBMODEL",
            "value": 141
        },
        "SUBMODEL_IS_MISSING": {
            "message": "subModels field is missing in request body",
            "status": 400,
            "code": "SUBMODEL_IS_MISSING",
            "value": 142
        },
        "AVATAR_SIZE_LIMIT": {
            "status": 400,
            "message": "Avatar image cannot be larger than 1 MB",
            "code": "AVATAR_SIZE_LIMIT",
            "value": 143
        },
        "INVALID_USERNAME": {
            "message": "Invalid username",
            "status": 400,
            "code": "INVALID_USERNAME",
            "value": 144
        },
        "FILE_NO_EXT": {
            "message": "Filename must have extension",
            "status": 400,
            "code": "FILE_NO_EXT",
            "value": 145
        },
        "SCREENSHOT_NOT_FOUND": {
            "message": "Screenshot not found",
            "status": 404,
            "code": "SCREENSHOT_NOT_FOUND",
            "value": 146
        },
        "ISSUE_INVALID_STATUS": {
            "message": "Invalid issue status",
            "status": 400,
            "code": "ISSUE_INVALID_STATUS",
            "value": 147
        },
        "ISSUE_INVALID_PRIORITY": {
            "message": "Invalid issue priority",
            "status": 400,
            "code": "ISSUE_INVALID_PRIORITY",
            "value": 148
        },
        "ISSUE_SAME_STATUS": {
            "message": "New status is the same as current status",
            "status": 400,
            "code": "ISSUE_SAME_STATUS",
            "value": 149
        },
        "ISSUE_SAME_PRIORITY": {
            "message": "New priority is the same as current priority",
            "status": 400,
            "code": "ISSUE_SAME_PRIORITY",
            "value": 150
        },
        "MESH_NOT_FOUND": {
            "message": "Mesh not found",
            "status": 400,
            "code": "MESH_NOT_FOUND",
            "value": 151
        },
        "GROUP_ID_NOT_FOUND_IN_MESH": {
            "message": "Group ID not found in mesh",
            "status": 400,
            "code": "GROUP_ID_NOT_FOUND_IN_MESH",
            "value": 152
        },
        "MODEL_NAME_TOO_LONG": {
            "message": "Model name cannot be longer than 60 characters",
            "status": 400,
            "code": "MODEL_NAME_TOO_LONG",
            "value": 153
        },
        "ISSUE_SYSTEM_COMMENT": {
            "message": "Can't edit or remove system comment",
            "status": 400,
            "code": "ISSUE_SYSTEM_COMMENT",
            "value": 154
        },
        "ISSUE_UPDATE_PERMISSION_DECLINED": {
            "message": "No permission to update issue",
            "status": 400,
            "code": "ISSUE_UPDATE_PERMISSION_DECLINED",
            "value": 155
        },
        "ISSUE_UPDATE_FAILED": {
            "message": "Failed updating issue",
            "status": 500,
            "code": "ISSUE_UPDATE_FAILED",
            "value": 156
        },
        "REMOVE_MODEL_FAILED": {
            "message": "Failed to remove data associated with model",
            "status": 500,
            "code": "REMOVE_MODEL_FAILED",
            "value": 157
        },
        "INVALID_MODEL_CODE": {
            "message": "Model code must contain only alphabets and numerical digits",
            "status": 400,
            "code": "INVALID_MODEL_CODE",
            "value": 158
        },
        "DUPLICATED_ENTRIES": {
            "message": "Two or more given fields are the same",
            "status": 400,
            "code": "DUPLICATED_ENTRIES",
            "value": 159
        },
        "MESH_STASH_NOT_FOUND": {
            "message": "Message stash not found",
            "status": 404,
            "code": "MESH_STASH_NOT_FOUND",
            "value": 160
        },
        "BUNDLE_STASH_NOT_FOUND": {
            "message": "Asset bundle not found",
            "status": 404,
            "code": "BUNDLE_STASH_NOT_FOUND",
            "value": 161
        },
        "INVALID_ROLE_TEMPLATE": {
            "message": "Role template requested doesn't exist",
            "status": 500,
            "code": "INVALID_ROLE_TEMPLATE",
            "value": 162
        },
        "MISSING_INIT_INVOICE": {
            "message": "Missing init invoice",
            "status": 500,
            "code": "MISSING_INIT_INVOICE",
            "value": 163
        },
        "MISSING_LAST_INVOICE": {
            "message": "Missing last invoice",
            "status": 500,
            "code": "MISSING_LAST_INVOICE",
            "value": 164
        },
        "NEW_OLD_PASSWORD_SAME": {
            "message": "New password can't be the same as old password",
            "status": 400,
            "code": "NEW_OLD_PASSWORD_SAME",
            "value": 165
        },
        "TEXTURE_NOT_FOUND": {
            "message": "Texture not found",
            "status": 404,
            "code": "TEXTURE_NOT_FOUND",
            "value": 166
        },
        "METADATA_NOT_FOUND": {
            "message": "Metadata not found",
            "status": 404,
            "code": "METADATA_NOT_FOUND",
            "value": 167
        },
        "SEQ_TAG_NOT_FOUND": {
            "message": "Sequence Tag not set",
            "status": 404,
            "code": "SEQ_TAG_NOT_FOUND",
            "value": 168
        },
        "UNKNOWN_PAY_PLAN": {
            "message": "Unknown paypal plan",
            "status": 500,
            "code": "UNKNOWN_PAY_PLAN",
            "value": 169
        },
        "JOB_NOT_FOUND": {
            "message": "Job not found",
            "status": 404,
            "code": "JOB_NOT_FOUND",
            "value": 170
        },
        "DUP_JOB": {
            "message": "Duplicate job id",
            "status": 400,
            "code": "DUP_JOB",
            "value": 171
        },
        "JOB_ASSIGNED": {
            "message": "Cannot remove assigned job",
            "status": 400,
            "code": "JOB_ASSIGNED",
            "value": 172
        },
        "JOB_ID_INVALID": {
            "message": "Invalid job ID",
            "status": 400,
            "code": "JOB_ID_INVALID",
            "value": 173
        },
        "DUP_PERM_TEMPLATE": {
            "message": "Duplicate template ID",
            "status": 400,
            "code": "DUP_PERM_TEMPLATE",
            "value": 174
        },
        "PERM_NOT_FOUND": {
            "message": "Permission template not found",
            "status": 404,
            "code": "PERM_NOT_FOUND",
            "value": 175
        },
        "INVALID_PERM": {
            "message": "Invalid permission",
            "status": 400,
            "code": "INVALID_PERM",
            "value": 176
        },
        "GROUP_BY_FIELD_NOT_SUPPORTED": {
            "message": "Group by field is not supported",
            "status": 400,
            "code": "GROUP_BY_FIELD_NOT_SUPPORTED",
            "value": 177
        },
        "DUP_ACCOUNT_PERM": {
            "message": "Duplicate account permission",
            "status": 400,
            "code": "DUP_ACCOUNT_PERM",
            "value": 178
        },
        "ACCOUNT_PERM_NOT_FOUND": {
            "message": "Account permission not found",
            "status": 404,
            "code": "ACCOUNT_PERM_NOT_FOUND",
            "value": 179
        },
        "ACCOUNT_PERM_EMPTY": {
            "message": "Cannot add empty permissions",
            "status": 404,
            "code": "ACCOUNT_PERM_EMPTY",
            "value": 180
        },
        "ADMIN_TEMPLATE_CANNOT_CHANGE": {
            "message": "Admin permission template cannot be changed or deleted",
            "status": 400,
            "code": "ADMIN_TEMPLATE_CANNOT_CHANGE",
            "value": 181
        },
        "UNSUPPORTED_STORAGE_TYPE": {
            "message": "File is stored in an unsupported storage type",
            "status": 500,
            "code": "UNSUPPORTED_STORAGE_TYPE",
            "value": 182
        },
        "UNRECOGNISED_STORAGE_TYPE": {
            "message": "File is stored an unrecognised storage type",
            "status": 500,
            "code": "UNRECOGNISED_STORAGE_TYPE",
            "value": 183
        },
        "VAT_CODE_ERROR": {
            "message": "Error validating VAT number",
            "status": 500,
            "code": "VAT_CODE_ERROR",
            "value": 184
        },
        "TEAMSPACE_SETTINGS_NOT_FOUND": {
            "message": "Teamspace settings not found",
            "status": 404,
            "code": "TEAMSPACE_SETTINGS_NOT_FOUND",
            "value": 185
        },
        "NOTIFICATION_NOT_FOUND": {
            "message": "Notification not found",
            "status": 404,
            "code": "NOTIFICATION_NOT_FOUND",
            "value": 186
        },
        "INVALID_STREAM_SESSION": {
            "message": "The streaming session code is not valid",
            "status": 400,
            "code": "INVALID_STREAM_SESSION",
            "value": 187
        }
    },
    "permissions": {
        "PERM_CHANGE_MODEL_SETTINGS": "change_model_settings",
        "PERM_UPLOAD_FILES": "upload_files",
        "PERM_CREATE_ISSUE": "create_issue",
        "PERM_COMMENT_ISSUE": "comment_issue",
        "PERM_VIEW_ISSUE": "view_issue",
        "PERM_VIEW_MODEL": "view_model",
        "PERM_DOWNLOAD_MODEL": "download_model",
        "PERM_EDIT_FEDERATION": "edit_federation",
        "PERM_DELETE_FEDERATION": "delete_federation",
        "PERM_DELETE_MODEL": "delete_model",
        "PERM_MANAGE_MODEL_PERMISSION": "manage_model_permission"
    },
    "impliedPermission": {
        "teamspace_admin": {
            "account": ["assign_licence", "revoke_licence", "teamspace_admin", "create_project", "create_job", "delete_job", "assign_job", "view_projects"],
            "project": ["create_model", "create_federation", "admin_project", "edit_project", "delete_project", "upload_files_all_models", "edit_federation_all_models", "create_issue_all_models", "comment_issue_all_models", "view_issue_all_models", "view_model_all_models", "download_model_all_models", "change_model_settings_all_models"],
            "model": ["change_model_settings", "upload_files", "create_issue", "comment_issue", "view_issue", "view_model", "download_model", "edit_federation", "delete_federation", "delete_model", "manage_model_permission"]
        },
        "view_projects": {
            "project": ["view_issue_all_models", "view_model_all_models"],
            "model": ["view_model", "view_issue"]
        },
        "admin_project": {
            "project": ["create_model", "create_federation", "admin_project", "edit_project", "delete_project", "upload_files_all_models", "edit_federation_all_models", "create_issue_all_models", "comment_issue_all_models", "view_issue_all_models", "view_model_all_models", "download_model_all_models", "change_model_settings_all_models"],
            "model": ["change_model_settings", "upload_files", "create_issue", "comment_issue", "view_issue", "view_model", "download_model", "edit_federation", "delete_federation", "delete_model", "manage_model_permission"]
        },
        "upload_files_all_models": {
            "model": ["upload_files"]
        },
        "edit_federation_all_models": {
            "model": ["edit_federation"]
        },
        "create_issue_all_models": {
            "model": ["create_issue"]
        },
        "comment_issue_all_models": {
            "model": ["comment_issue"]
        },
        "view_issue_all_models": {
            "model": ["view_issue"]
        },
        "view_model_all_models": {
            "model": ["view_model"]
        },
        "download_model_all_models": {
            "model": ["download_model"]
        },
        "change_model_settings_all_models": {
            "model": ["change_model_settings"]
        },
        "manage_model_permission": {
            "model": ["change_model_settings", "upload_files", "create_issue", "comment_issue", "view_issue", "view_model", "download_model", "edit_federation", "delete_federation", "delete_model", "manage_model_permission"]
        }
    },
    "userId": undefined
}
