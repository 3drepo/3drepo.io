module.exports = {
    "env": {
        "browser": true
    },
    "globals" : {
        "angular" : true,
        "Viewer" : true,
        "ViewerUtil" : true,
        "UnityUtil" : true,
        "Module" : true,
        "Pin" : true,
        "Promise" : true,
        "server_config" : true
    },
    "extends": "eslint:recommended",
    "rules": {
        "block-scoped-var" : [
            "error"
        ],
        "curly" : [
            "error",
            "all"
        ],
        "no-console": "off",
        "brace-style" : [
            "error", 
            "1tbs"
        ],
        "array-bracket-spacing": [
            "error", 
            "never"
        ],
        "comma-style": ["error", "last"],
        "comma-dangle": [
            "error", 
            "never"
        ],
        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};