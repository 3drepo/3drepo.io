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
        "no-console": "off",
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