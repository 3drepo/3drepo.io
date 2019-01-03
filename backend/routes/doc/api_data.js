define({ "api": [
  {
    "type": "post",
    "url": "/permissions/",
    "title": "Create a permission",
    "name": "createPermission",
    "group": "Account_Permission",
    "description": "<p>Create a new account permissions</p>",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "String[]",
            "optional": false,
            "field": "permissions",
            "description": "<p>Account Level Permission types</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n [\n    {\n      \"user\": \"username1\",\n      \"permissions\": [\n          \"permission_type\"\n      ]\n    }\n ]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Missing",
            "description": "<p>or invalid arguments</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response",
          "content": "HTTP/1.1 400 Bad Request\n  {\n    \"message\": \"Missing or invalid arguments\",\n    \"status\": 400,\n    \"code\": \"INVALID_ARGUMENTS\",\n    \"value\": 10,\n    \"place\": \"POST /permissions\"\n  }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./accountPermission.js",
    "groupTitle": "Account_Permission"
  },
  {
    "type": "delete",
    "url": "/permissions/:user",
    "title": "Delete a permission",
    "name": "deletePermission",
    "group": "Account_Permission",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "user",
            "description": "<p>User to delete</p>"
          }
        ]
      }
    },
    "description": "<p>Update an existing permission for a teamspace member.</p>",
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Missing",
            "description": "<p>or invalid arguments</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "HTTP/1.1 401 Unauth­orized",
          "content": "\nHTTP/1.1 401 Unauth­orized\n  {\n    \"message\": \"Missing or invalid arguments\",\n    \"status\": 401,\n    \"code\": \"NOT_AUTHORIZED\",\n    \"value\": 9,\n    \"place\": \"GET /permissions\"\n  }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./accountPermission.js",
    "groupTitle": "Account_Permission"
  },
  {
    "type": "get",
    "url": "/permissions/",
    "title": "List all permissions",
    "name": "listPermissions",
    "group": "Account_Permission",
    "description": "<p>List all account level permissions</p>",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "user",
            "description": "<p>Current user account</p>"
          },
          {
            "group": "200",
            "type": "String[]",
            "optional": false,
            "field": "permissions",
            "description": "<p>Account level permissions</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n [\n    {\n      \"user\": \"username\",\n      \"permissions\": [\n          \"teamspace_admin\"\n      ]\n    }\n ]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NOT_AUTHORIZED",
            "description": "<p>Not Authorized</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Example",
          "content": "HTTP/1.1 401 Unauthorized\n  {\n    \"message\": \"Not Authorized\",\n    \"status\": 401,\n    \"code\": \"NOT_AUTHORIZED\",\n    \"value\": 9,\n    \"place\": \"GET /permissions\"\n  }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./accountPermission.js",
    "groupTitle": "Account_Permission"
  },
  {
    "type": "put",
    "url": "/permissions/:user",
    "title": "Update a permission",
    "name": "updatePermission",
    "group": "Account_Permission",
    "description": "<p>Create a new account level permission for a user.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "user",
            "description": "<p>User to update</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response",
          "content": "\nHTTP/1.1 200 OK\n[\n   {\n    \"model\": \"model_ID\",\n    \"name\": \"model_name\",\n    \"permissions\": [\n        {\n            \"user\": \"username1\"\n        },\n        {\n            \"user\": \"username2\"\n        }\n    ],\n    \"subModels\": []\n   }\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./accountPermission.js",
    "groupTitle": "Account_Permission"
  },
  {
    "type": "post",
    "url": "/:account",
    "title": "Sign up form",
    "name": "signUp",
    "group": "Authorisation_",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "account",
            "description": "<p>New Account username to register.</p>"
          }
        ]
      }
    },
    "description": "<p>Sign up a new user account.</p>",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "account",
            "description": "<p>New Account username</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": "HTTP/1.1 200 OK\n{\n \"account\":\"newAccountUsername\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "SIGN_UP_PASSWORD_MISSING",
            "description": "<p>Sign Up Password is missing.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response",
          "content": "\nHTTP/1.1 400 Bad Request\n{\n  \"message\": \"Password is missing\",\n  \"status\": 400,\n  \"code\": \"SIGN_UP_PASSWORD_MISSING\",\n  \"value\": 57,\n  \"place\": \"POST /nabile\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./auth.js",
    "groupTitle": "Authorisation_"
  },
  {
    "type": "get",
    "url": "/login/",
    "title": "Check user is logged in",
    "name": "checkLogin",
    "group": "Authorisation",
    "description": "<p>Check user is still logged into current session.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Registered Account Username.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Registered User Account Password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "User",
            "description": "<p>profile.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": "HTTP/1.1 200 OK\n\t{\n  \"username\": \"username1\",\n  \"roles\": [\n      {\n          \"role\": \"team_member\",\n          \"db\": \"database_name\"\n      },\n      {\n          \"role\": \"team_member\",\n          \"db\": \"database_name1\"\n      },\n      {\n          \"role\": \"team_member\",\n          \"db\": \"database_name2\"\n      }\n  ],\n  \"flags\": {\n      \"termsPrompt\": false\n  }\n\t}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./auth.js",
    "groupTitle": "Authorisation"
  },
  {
    "type": "get",
    "url": "/forgot-password/",
    "title": "User Forgot Password request",
    "name": "forgotPassword",
    "group": "Authorisation",
    "description": "<p>Reset a registered user password.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Username to use for password reset</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email to use for password reset</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "Empty",
            "description": "<p>Object</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "SIGN_UP_PASSWORD_MISSING",
            "description": "<p>Password is missing</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response",
          "content": "\nHTTP/1.1 400 Bad Request\n{\n  \"message\": \"Password is missing\",\n  \"status\": 400,\n  \"code\": \"SIGN_UP_PASSWORD_MISSING\",\n  \"value\": 57,\n  \"place\": \"POST /forgotPassword\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./auth.js",
    "groupTitle": "Authorisation"
  },
  {
    "type": "get",
    "url": "/:account.json/",
    "title": "Get User Avatar",
    "name": "getAvatar",
    "group": "Authorisation",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "account",
            "description": "<p>The avatar image for requested account.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "avatar",
            "description": "<p>User Avatar Image</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "404": [
          {
            "group": "404",
            "optional": false,
            "field": "USER_DOES_NOT_HAVE_AVATAR",
            "description": "<p>User does not have an avatar</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response",
          "content": "\nHTTP/1.1 404 Not Found\n{\n  \"message\": \"User does not have an avatar\",\n  \"status\": 404,\n  \"code\": \"SIGN_UP_PASSWORD_MISSING\",\n  \"place\": \"POST /:account/avatar\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./auth.js",
    "groupTitle": "Authorisation"
  },
  {
    "type": "get",
    "url": "/:account.json/",
    "title": "List account information",
    "name": "listInfo",
    "group": "Authorisation",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "account.json",
            "description": "<p>The Account to list information for.</p>"
          }
        ]
      }
    },
    "description": "<p>List account information for provided account.json file.</p>",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object[]",
            "optional": false,
            "field": "User",
            "description": "<p>account</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": "HTTP/1.1 200 OK\n{\n    \"accounts\": [\n        {\n            \"account\": \"username1\",\n            \"projects\": [\n                {\n                    \"_id\": \"model_ID\",\n                    \"name\": \"Sample_Project\",\n                    \"__v\": 37,\n                    \"permissions\": [\n                        \"create_model\",\n                        \"create_federation\",\n                        \"admin_project\",\n                        \"edit_project\",\n                        \"delete_project\",\n                        \"upload_files_all_models\",\n                        \"edit_federation_all_models\",\n                        \"create_issue_all_models\",\n                        \"comment_issue_all_models\",\n                        \"view_issue_all_models\",\n                        \"view_model_all_models\",\n                        \"download_model_all_models\",\n                        \"change_model_settings_all_models\"\n                    ],\n                    \"models\": [\n                        {\n                            \"permissions\": [\n                                \"change_model_settings\",\n                                \"upload_files\",\n                                \"create_issue\",\n                                \"comment_issue\",\n                                \"view_issue\",\n                                \"view_model\",\n                                \"download_model\",\n                                \"edit_federation\",\n                                \"delete_federation\",\n                                \"delete_model\",\n                                \"manage_model_permission\"\n                            ],\n                            \"model\": \"model_ID_1\",\n                            \"name\": \"Model_Name_1\",\n                            \"status\": \"ok\",\n                            \"timestamp\": \"2018-11-27T09:59:56.470Z\"\n                        },\n                        {\n                            \"permissions\": [\n                                \"change_model_settings\",\n                                \"upload_files\",\n                                \"create_issue\",\n                                \"comment_issue\",\n                                \"view_issue\",\n                                \"view_model\",\n                                \"download_model\",\n                                \"edit_federation\",\n                                \"delete_federation\",\n                                \"delete_model\",\n                                \"manage_model_permission\"\n                            ],\n                            \"model\": \"model_ID_2\",\n                            \"name\": \"Model_Name_2\",\n                            \"status\": \"ok\",\n                            \"timestamp\": \"2018-11-27T09:57:19.345Z\"\n                        },\n                        {\n                            \"permissions\": [\n                                \"change_model_settings\",\n                                \"upload_files\",\n                                \"create_issue\",\n                                \"comment_issue\",\n                                \"view_issue\",\n                                \"view_model\",\n                                \"download_model\",\n                                \"edit_federation\",\n                                \"delete_federation\",\n                                \"delete_model\",\n                                \"manage_model_permission\"\n                            ],\n                            \"model\": \"model_ID_3\",\n                            \"name\": \"Model_Name_3\",\n                            \"status\": \"ok\",\n                            \"timestamp\": \"2018-11-26T17:19:26.175Z\"\n                        },\n                        {\n                            \"permissions\": [\n                                \"change_model_settings\",\n                                \"upload_files\",\n                                \"create_issue\",\n                                \"comment_issue\",\n                                \"view_issue\",\n                                \"view_model\",\n                                \"download_model\",\n                                \"edit_federation\",\n                                \"delete_federation\",\n                                \"delete_model\",\n                                \"manage_model_permission\"\n                            ],\n                            \"model\": \"mode_ID_4\",\n                            \"name\": \"Model_Name_4\",\n                            \"status\": \"queued\",\n                            \"timestamp\": null\n                        }\n                    ]\n                },\n                {\n                    \"_id\": \"model_ID_3\",\n                    \"name\": \"Model_Name_4\",\n                    \"__v\": 2,\n                    \"permissions\": [\n                        \"create_model\",\n                        \"create_federation\",\n                        \"admin_project\",\n                        \"edit_project\",\n                        \"delete_project\",\n                        \"upload_files_all_models\",\n                        \"edit_federation_all_models\",\n                        \"create_issue_all_models\",\n                        \"comment_issue_all_models\",\n                        \"view_issue_all_models\",\n                        \"view_model_all_models\",\n                        \"download_model_all_models\",\n                        \"change_model_settings_all_models\"\n                    ],\n                    \"models\": [\n                        {\n                            \"permissions\": [\n                                \"change_model_settings\",\n                                \"upload_files\",\n                                \"create_issue\",\n                                \"comment_issue\",\n                                \"view_issue\",\n                                \"view_model\",\n                                \"download_model\",\n                                \"edit_federation\",\n                                \"delete_federation\",\n                                \"delete_model\",\n                                \"manage_model_permission\"\n                            ],\n                            \"model\": \"model_ID_5\",\n                            \"name\": \"model\",\n                            \"status\": \"queued\",\n                            \"timestamp\": \"2018-11-22T15:47:57.000Z\"\n                        }\n                    ]\n                }\n            ],\n            \"models\": [],\n            \"fedModels\": [],\n            \"isAdmin\": true,\n            \"permissions\": [\n                \"assign_licence\",\n                \"revoke_licence\",\n                \"teamspace_admin\",\n                \"create_project\",\n                \"create_job\",\n                \"delete_job\",\n                \"assign_job\",\n                \"view_projects\"\n            ]\n        }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./auth.js",
    "groupTitle": "Authorisation"
  },
  {
    "type": "post",
    "url": "/login",
    "title": "Create a Login session",
    "name": "login",
    "group": "Authorisation",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Account username</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>User account password</p>"
          }
        ]
      }
    },
    "description": "<p>Login into a verified and registered 3D Repo account.</p>",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "User",
            "description": "<p>account information.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": "HTTP/1.1 200 OK\n\t{\n  \"username\": \"username1\",\n  \"roles\": [\n      {\n          \"role\": \"team_member\",\n          \"db\": \"database_name\"\n      },\n      {\n          \"role\": \"team_member\",\n          \"db\": \"database_name1\"\n      },\n      {\n          \"role\": \"team_member\",\n          \"db\": \"database_name2\"\n      }\n  ],\n  \"flags\": {\n      \"termsPrompt\": false\n  }\n\t}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotAuthorized",
            "description": "<p>User was not authorised.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response",
          "content": "\nHTTP/1.1 401 Unauth­orized\n  {\n    \"message\": \"Not Authorized\",\n    \"status\": 401,\n    \"code\": \"NOT_AUTHORIZED\",\n    \"value\": 9,\n    \"place\": \"GET /login\"\n  }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./auth.js",
    "groupTitle": "Authorisation"
  },
  {
    "type": "get",
    "url": "/logout/",
    "title": "Create a logout request",
    "name": "logout",
    "group": "Authorisation",
    "description": "<p>Logout current user</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Account username</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Registered Account Username</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": "HTTP/1.1 200 OK\n{\n \"username\": \"username1\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./auth.js",
    "groupTitle": "Authorisation"
  },
  {
    "type": "get",
    "url": "/version/",
    "title": "Print application version",
    "name": "printVersion",
    "group": "Authorisation",
    "description": "<p>Print current application version.</p>",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "Current",
            "description": "<p>Application Version number.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": "HTTP/1.1 200 OK\n{\n  \"VERSION\": \"2.20.1\",\n  \"unity\": {\n      \"current\": \"2.20.0\",\n      \"supported\": []\n   },\n  \"navis\": {\n      \"current\": \"2.16.0\",\n      \"supported\": [\n          \"2.8.0\"\n      ]\n  },\n  \"unitydll\": {\n      \"current\": \"2.8.0\",\n      \"supported\": []\n  }\n }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./auth.js",
    "groupTitle": "Authorisation"
  },
  {
    "type": "put",
    "url": "/:account/password",
    "title": "Reset User Password",
    "name": "resetPassword",
    "group": "Authorisation",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "account",
            "description": "<p>Account to reset password for.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>New password to reset to.</p>"
          }
        ]
      }
    },
    "description": "<p>Reset existing user account password</p>",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "account",
            "description": "<p>Account username</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": " HTTP/1.1 200 OK\n {\n\t\"account\":\"username1\"\n }",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "TOKEN_INVALID",
            "description": "<p>Token is invalid or expired.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response",
          "content": "\nHTTP/1.1 400 Bad Request\n{\n\t\"message\":\"Token is invalid or expired\",\n\t\"status\":400,\"code\":\"TOKEN_INVALID\",\n\t\"value\":59,\n\t\"place\": \"PUT /username1/password\"\n\t}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./auth.js",
    "groupTitle": "Authorisation"
  },
  {
    "type": "put",
    "url": "/:account",
    "title": "Update User password",
    "name": "updateUser",
    "group": "Authorisation",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "account",
            "description": "<p>Registered Account Username</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "User",
            "description": "<p>Updated</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": "HTTP/1.1 200 OK\n{\n \"account\":\"newAccountUsername\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./auth.js",
    "groupTitle": "Authorisation"
  },
  {
    "type": "post",
    "url": "/:account/avatar",
    "title": "Get User Avatar",
    "name": "uploadAvatar",
    "group": "Authorisation",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "account",
            "description": "<p>The account to upload avatar to.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "image",
            "description": "<p>The avatar to upload.</p>"
          }
        ]
      }
    },
    "description": "<p>Upload a new user Avatar.</p>",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "status",
            "description": "<p>Status of Avatar upload.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": "HTTP/1.1 200 OK\n{\n \"status\":\"success\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./auth.js",
    "groupTitle": "Authorisation"
  },
  {
    "type": "post",
    "url": "/:account/verify",
    "title": "Verify the user",
    "name": "verify",
    "group": "Authorisation",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "account",
            "description": "<p>New account username.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Account",
            "description": "<p>Verified</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "ALREADY_VERIFIED",
            "description": "<p>User Already verified</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response",
          "content": "\nHTTP/1.1 400 Bad Request\n{\n  \"message\": \"Already verified\",\n  \"status\": 400,\n  \"code\": \"ALREADY_VERIFIED\",\n  \"value\": 60,\n  \"place\": \"POST /niblux/verify\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./auth.js",
    "groupTitle": "Authorisation"
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./doc/main.js",
    "group": "C__xampp_htdocs_local3d_3drepo_io_backend_routes_doc_main_js",
    "groupTitle": "C__xampp_htdocs_local3d_3drepo_io_backend_routes_doc_main_js",
    "name": ""
  },
  {
    "type": "post",
    "url": "/groups/",
    "title": "Create a group",
    "name": "createGroup",
    "description": "<p>Add a group to the model.</p>",
    "group": "Groups",
    "version": "0.0.0",
    "filename": "./group.js",
    "groupTitle": "Groups"
  },
  {
    "type": "delete",
    "url": "/groups/",
    "title": "Delete groups",
    "name": "deleteGroups",
    "description": "<p>Delete groups from the model.</p>",
    "group": "Groups",
    "version": "0.0.0",
    "filename": "./group.js",
    "groupTitle": "Groups"
  },
  {
    "type": "get",
    "url": "/groups/revision/master/head/",
    "title": "List model groups",
    "name": "listGroups",
    "group": "Groups",
    "description": "<p>Get all groups for current model.</p>",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object[]",
            "optional": false,
            "field": "List",
            "description": "<p>of all Groups</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": "\nHTTP/1.1 200 OK\n\t{\n\t\t\"_id\":\"model_ID\",\n\t\t\"__v\":0,\n\t\t\"name\":\"Changed\",\n\t\t\"author\":\"username\",\n\t\t\"createdAt\":1536747251756,\n\t\t\"updatedBy\":\"username\",\n\t\t\"updatedAt\":1536747551043,\n\t\t\"color\":[152,233,75],\n\t\t\"objects\":[]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./group.js",
    "groupTitle": "Groups"
  },
  {
    "type": "get",
    "url": "/groups/revision/:rid/",
    "title": "List model groups by revision",
    "description": "<p>List all groups using the revision ID</p>",
    "name": "listGroupsByRevision",
    "group": "Groups",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Revision unique ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./group.js",
    "groupTitle": "Groups"
  },
  {
    "type": "put",
    "url": "/groups/:uid/",
    "title": "Update group",
    "name": "updateGroup",
    "description": "<p>Update a group using Group ID</p>",
    "group": "Groups",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Group unique ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./group.js",
    "groupTitle": "Groups"
  },
  {
    "type": "get",
    "url": "/invoices",
    "title": "List all invoices",
    "name": "listInvoices",
    "group": "Invoice",
    "version": "0.0.0",
    "filename": "./invoice.js",
    "groupTitle": "Invoice"
  },
  {
    "type": "get",
    "url": "/invoices/:invoiceNo.html",
    "title": "Render invoices as HTML",
    "name": "renderInvoice",
    "group": "Invoice",
    "version": "0.0.0",
    "filename": "./invoice.js",
    "groupTitle": "Invoice"
  },
  {
    "type": "get",
    "url": "/invoices/:invoiceNo.pdf",
    "title": "Render invoices as PDF",
    "name": "renderInvoicePDF",
    "group": "Invoice",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "invoiceNo.pdf",
            "description": "<p>Invoice to render.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./invoice.js",
    "groupTitle": "Invoice"
  },
  {
    "type": "get",
    "url": "/issues/analytics.:format",
    "title": "Get Issue Analytics",
    "name": "getIssueAnalytics",
    "group": "Issues_Analytics",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "analytics.:format",
            "description": "<p>Analytics file to create</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./issueAnalytic.js",
    "groupTitle": "Issues_Analytics"
  },
  {
    "type": "get",
    "url": "/issues/:uid.json",
    "title": "Find Issue by ID",
    "name": "findIssueById",
    "group": "Issues",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Issue unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "issue",
            "description": "<p>The Issue matching the Issue ID</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Example of returned data on success:",
          "content": "{\n\t\taccount: \"T_E_S_T\"\n\t\tassigned_roles: []\n\t\tcommentCount: 0\n\t\tcreated: 1542723030489\n\t\tcreator_role: \"3D Repo\"\n\t\tdesc: \"(No Description)\"\n\t\tmodel: \"0687ef98-52b8-4910-a211-4cef1cb7422c\"\n\t\tmodelCode: \"\"\n\t\tname: \"Issue one\"\n\t\tnorm: []\n\t\tnumber: 1\n\t\towner: \"nabile\"\n\t\tposition: []\n\t\tpriority: \"none\"\n\t\trev_id: \"97569b32-deb2-4ab4-98d6-bf0fe45b7d55\"\n\t\tscale: 1\n\t\tstatus: \"open\"\n\t\tthumbnail: \"T_E_S_T/0687ef98-52b8-4910-a211-4cef1cb7422c/issues/09a4bf10-ecce-11e8-9c10-cbf0778834d1/thumbnail.png\"\n\t\ttopic_type: \"for_information\"\n\t\ttypePrefix: \"Architectural\"\n\t\tviewCount: 1\t\n\t\tviewpoint: {near: 24.057758331298828, far: 12028.87890625, fov: 1.0471975803375244,…}\n\t\t__v: 0\n\t\t_id: \"09a4bf10-ecce-11e8-9c10-cbf0778834d1\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "IssueNotFound",
            "description": "<p>The issue requested was not found</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "get",
    "url": "/issues/:uid.json",
    "title": "Get Issue Thumbnail",
    "name": "findIssueById",
    "group": "Issues",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Issue unique ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "get",
    "url": "/issues.bcfzip",
    "title": "Get Issues BCF zip file",
    "name": "getIssuesBCF",
    "group": "Issues",
    "version": "0.0.0",
    "filename": "./issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "post",
    "url": "/revision/:rid/issues.bcfzip",
    "title": "Post Issues BCF zip file by revision ID",
    "name": "getIssuesBCF",
    "group": "Issues",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Revision unique ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "get",
    "url": "/revision/:rid/issues.bcfzip",
    "title": "Get Issues BCF zip file by revision ID",
    "name": "getIssuesBCF",
    "group": "Issues",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Revision unique ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "get",
    "url": "/issues.bcfzip",
    "title": "Get Issue Screenshot",
    "name": "getScreenshot",
    "group": "Issues",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Viewpoint unique ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "get",
    "url": "/issues/:uid/viewpoints/:vid/screenshotSmall.png",
    "title": "Get smaller version of Issue screenshot",
    "name": "getScreenshotSmall",
    "group": "Issues",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Viewpoint unique ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "post",
    "url": "/issues.bcfzip",
    "title": "Import BCF file",
    "name": "importBCF",
    "group": "Issues",
    "version": "0.0.0",
    "filename": "./issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "get",
    "url": "/revision/:rid/issues.json",
    "title": "Get all Issues by revision ID",
    "name": "listIssues",
    "group": "Issues",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Revision unique ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "get",
    "url": "/issues.json",
    "title": "Get all Issues",
    "name": "listIssues",
    "group": "Issues",
    "version": "0.0.0",
    "filename": "./issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "get",
    "url": "revision/:rid/issues.html",
    "title": "Issues response into as HTML by revision ID",
    "name": "renderIssuesHTML",
    "group": "Issues",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Revision unique ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "get",
    "url": "/issues.html",
    "title": "Issues response into as HTML",
    "name": "renderIssuesHTML",
    "group": "Issues",
    "version": "0.0.0",
    "filename": "./issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "post",
    "url": "/issuesId.json",
    "title": "Store issue based on revision",
    "name": "storeIssue",
    "group": "Issues",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "rid",
            "description": "<p>Unique Revision ID to store.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "put",
    "url": "revision/\"rid/issues/:issueId.json",
    "title": "Update issue based on revision",
    "name": "updateIssue",
    "group": "Issues",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "rid",
            "description": "<p>Unique Revision ID to update to.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "issueId",
            "description": "<p>Unique Issue ID to update.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "post",
    "url": "/jobs/:jobId/:user",
    "title": "Assign a job to a user",
    "name": "addUserToJob",
    "group": "Jobs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "jobId",
            "description": "<p>Unique Job ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "user",
            "description": "<p>User to assign job to.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./job.js",
    "groupTitle": "Jobs"
  },
  {
    "type": "post",
    "url": "/jobs",
    "title": "Create a new job",
    "name": "createJob",
    "group": "Jobs",
    "version": "0.0.0",
    "filename": "./job.js",
    "groupTitle": "Jobs"
  },
  {
    "type": "delete",
    "url": "/jobs/:jobId",
    "title": "Delete a job",
    "name": "deleteJob",
    "group": "Jobs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "jobId",
            "description": "<p>Unique Job ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./job.js",
    "groupTitle": "Jobs"
  },
  {
    "type": "get",
    "url": "/myJob",
    "title": "Get user Job",
    "name": "getUserJob",
    "group": "Jobs",
    "version": "0.0.0",
    "filename": "./job.js",
    "groupTitle": "Jobs"
  },
  {
    "type": "get",
    "url": "/jobs/colors",
    "title": "List all Colors",
    "name": "listColors",
    "group": "Jobs",
    "version": "0.0.0",
    "filename": "./job.js",
    "groupTitle": "Jobs"
  },
  {
    "type": "get",
    "url": "/jobs",
    "title": "List all Jobs",
    "name": "listJobs",
    "group": "Jobs",
    "version": "0.0.0",
    "filename": "./job.js",
    "groupTitle": "Jobs"
  },
  {
    "type": "delete",
    "url": "/jobs",
    "title": "Remove a job from a user",
    "name": "removeUserFromJobs",
    "group": "Jobs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>User to remove job from.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./job.js",
    "groupTitle": "Jobs"
  },
  {
    "type": "put",
    "url": "/jobs/:jobId",
    "title": "Update User Job",
    "name": "updateJob",
    "group": "Jobs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "jobId",
            "description": "<p>Unique Job ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./job.js",
    "groupTitle": "Jobs"
  },
  {
    "type": "get",
    "url": "/:model/maps/hereadminlabeloverlay/:zoomLevel/:gridx/:gridy.png",
    "title": "Get Here Admin Label Tile",
    "name": "getHereAdminLabelOverlayTile",
    "group": "Maps",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to list maps for</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "zoomLevel",
            "description": "<p>Map Zoom level</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "of",
            "description": "<p>tiles along row (x-cordinate)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Map",
            "description": "<p>image type (format) to return</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./maps.js",
    "groupTitle": "Maps"
  },
  {
    "type": "get",
    "url": "/:model/maps/herelabeloverlay/:zoomLevel/:gridx/:gridy.png",
    "title": "Get Here Label Overlay Tile",
    "name": "getHereAdminLabelOverlayTile",
    "group": "Maps",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to list maps for</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "zoomLevel",
            "description": "<p>Map Zoom level</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "of",
            "description": "<p>tiles along row (x-cordinate)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Map",
            "description": "<p>image type (format) to return</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./maps.js",
    "groupTitle": "Maps"
  },
  {
    "type": "get",
    "url": "/:model/maps/hereaerial/:zoomLevel/:gridx/:gridy.png",
    "title": "Get Here Aerial Maps Tile",
    "name": "getHereAerialMapsTile",
    "group": "Maps",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to list maps for</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "zoomLevel",
            "description": "<p>Map Zoom level</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "The",
            "description": "<p>number of tiles along row (x-cordinate)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Map",
            "description": "<p>image type (format) to return</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./maps.js",
    "groupTitle": "Maps"
  },
  {
    "type": "get",
    "url": "/:model/maps/hereinfo/",
    "title": "Get Here Base Info",
    "name": "getHereBaseInfo",
    "group": "Maps",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to list maps for</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./maps.js",
    "groupTitle": "Maps"
  },
  {
    "type": "get",
    "url": "/:model/maps/herepoi/:zoomLevel/:gridx/:gridy.png",
    "title": "Get Here Buildings From Longitude and Latitude",
    "name": "getHereBuildingsFromLongLat",
    "group": "Maps",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to list maps for</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "zoomLevel",
            "description": "<p>Map Zoom level</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "of",
            "description": "<p>tiles along row (x-cordinate)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Map",
            "description": "<p>image type (format) to return</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./maps.js",
    "groupTitle": "Maps"
  },
  {
    "type": "get",
    "url": "/:model/maps/heregrey/:zoomLevel/:gridx/:gridy.png",
    "title": "Get Here Grey Tile",
    "name": "getHereGreyTile",
    "group": "Maps",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to list maps for</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "zoomLevel",
            "description": "<p>Map Zoom level</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "of",
            "description": "<p>tiles along row (x-cordinate)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Map",
            "description": "<p>image type (format) to return</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./maps.js",
    "groupTitle": "Maps"
  },
  {
    "type": "get",
    "url": "/:model/maps/heregreytransit/:zoomLevel/:gridx/:gridy.png",
    "title": "Get Here Transit Tile",
    "name": "getHereGreyTransitTile",
    "group": "Maps",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to list maps for</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "zoomLevel",
            "description": "<p>Map Zoom level</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "of",
            "description": "<p>tiles along row (x-cordinate)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Map",
            "description": "<p>image type (format) to return</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./maps.js",
    "groupTitle": "Maps"
  },
  {
    "type": "get",
    "url": "/:model/maps/herehybrid/:zoomLevel/:gridx/:gridy.png",
    "title": "Get Here Hybrid Tile",
    "name": "getHereHybridTile",
    "group": "Maps",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to list maps for</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "zoomLevel",
            "description": "<p>Map Zoom level</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "of",
            "description": "<p>tiles along row (x-cordinate)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Map",
            "description": "<p>image type (format) to return</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./maps.js",
    "groupTitle": "Maps"
  },
  {
    "type": "get",
    "url": "/:model/maps/herelinelabeloverlay/:zoomLevel/:gridx/:gridy.png",
    "title": "Get Here Line Label Overlay Tile",
    "name": "getHereLineLabelOverlayTile",
    "group": "Maps",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to list maps for</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "zoomLevel",
            "description": "<p>Map Zoom level</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "of",
            "description": "<p>tiles along row (x-cordinate)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Map",
            "description": "<p>image type (format) to return</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./maps.js",
    "groupTitle": "Maps"
  },
  {
    "type": "get",
    "url": "/:model/maps/here/:zoomLevel/:gridx/:gridy.png",
    "title": "Get Here Maps Tile",
    "name": "getHereMapsTile",
    "group": "Maps",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to list maps for</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "zoomLevel",
            "description": "<p>Map Zoom level</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "number",
            "description": "<p>of tiles along row (x-cordinate)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Map",
            "description": "<p>image type (format) to return</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./maps.js",
    "groupTitle": "Maps"
  },
  {
    "type": "get",
    "url": "/:model/maps/herepoi/:zoomLevel/:gridx/:gridy.png",
    "title": "Get Here POI (Point of Interest) Tile",
    "name": "getHerePOITile",
    "group": "Maps",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to list maps for</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "zoomLevel",
            "description": "<p>Map Zoom level</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "of",
            "description": "<p>tiles along row (x-cordinate)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Map",
            "description": "<p>image type (format) to return</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./maps.js",
    "groupTitle": "Maps"
  },
  {
    "type": "get",
    "url": "/:model/maps/hereterrain/:zoomLevel/:gridx/:gridy.png",
    "title": "Get Here Terrain Tile",
    "name": "getHereTerrainTile",
    "group": "Maps",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to list maps for</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "zoomLevel",
            "description": "<p>Map Zoom level</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "of",
            "description": "<p>tiles along row (x-cordinate)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Map",
            "description": "<p>image type (format) to return</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./maps.js",
    "groupTitle": "Maps"
  },
  {
    "type": "get",
    "url": "/:model/maps/heretollzone/:zoomLevel/:gridx/:gridy.png",
    "title": "Get Here Tollzone Tile",
    "name": "getHereTollZoneTile",
    "group": "Maps",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to list maps for</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "zoomLevel",
            "description": "<p>Map Zoom level</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "of",
            "description": "<p>tiles along row (x-cordinate)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Map",
            "description": "<p>image type (format) to return</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./maps.js",
    "groupTitle": "Maps"
  },
  {
    "type": "get",
    "url": "/:model/maps/heretrafficflow/:zoomLevel/:gridx/:gridy.png",
    "title": "Get Here Traffic Flow",
    "name": "getHereTrafficTile",
    "group": "Maps",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to list maps for</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "zoomLevel",
            "description": "<p>Map Zoom level</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "of",
            "description": "<p>tiles along row (x-cordinate)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Map",
            "description": "<p>image type (format) to return</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./maps.js",
    "groupTitle": "Maps"
  },
  {
    "type": "get",
    "url": "/:model/maps/heretraffic/:zoomLevel/:gridx/:gridy.png",
    "title": "Get Here Traffic Tile",
    "name": "getHereTrafficTile",
    "group": "Maps",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to list maps for</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "zoomLevel",
            "description": "<p>Map Zoom level</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "number",
            "description": "<p>of tiles along row (x-cordinate)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Map",
            "description": "<p>image type (format) to return</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./maps.js",
    "groupTitle": "Maps"
  },
  {
    "type": "get",
    "url": "/:model/maps/heretruckoverlay/:zoomLevel/:gridx/:gridy.png",
    "title": "Get Here Truck Restrictions Overlay Tile",
    "name": "getHereTruckRestrictionsOverlayTile",
    "group": "Maps",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to list maps for</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "zoomLevel",
            "description": "<p>Map Zoom level</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "of",
            "description": "<p>tiles along row (x-cordinate)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Map",
            "description": "<p>image type (format) to return</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./maps.js",
    "groupTitle": "Maps"
  },
  {
    "type": "get",
    "url": "/:model/maps/heretruck/:zoomLevel/:gridx/:gridy.png",
    "title": "Get Here Truck Restrictions",
    "name": "getHereTruckRestrictionsTile",
    "group": "Maps",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to list maps for</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "zoomLevel",
            "description": "<p>Map Zoom level</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "of",
            "description": "<p>tiles along row (x-cordinate)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Map",
            "description": "<p>image type (format) to return</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./maps.js",
    "groupTitle": "Maps"
  },
  {
    "type": "get",
    "url": "/:model/maps/osm/:zoomLevel/:gridx/:gridy.png",
    "title": "Get OSMT file",
    "name": "getOSMTile",
    "group": "Maps",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "zoomLevel",
            "description": "<p>Map Zoom level.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to list maps for</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./maps.js",
    "groupTitle": "Maps"
  },
  {
    "type": "get",
    "url": ".:model/maps",
    "title": "List all Maps",
    "name": "listMaps",
    "group": "Maps",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to list maps for .</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./maps.js",
    "groupTitle": "Maps"
  },
  {
    "type": "get",
    "url": "/revision/master/head/meta/4DTaskSequence.json",
    "title": "Get All meta data for 4D Sequence Tags",
    "name": "getAllIdsWith4DSequenceTag",
    "group": "Meta",
    "version": "0.0.0",
    "filename": "./meta.js",
    "groupTitle": "Meta"
  },
  {
    "type": "get",
    "url": "/revision/:rev/meta/4DTaskSequence.json",
    "title": "Get All meta data with 4D Sequence Tags by revision",
    "name": "getAllIdsWith4DSequenceTag",
    "group": "Meta",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "rev",
            "description": "<p>Revision</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./meta.js",
    "groupTitle": "Meta"
  },
  {
    "type": "get",
    "url": "/revision/master/head/meta/findObjsWith/:metaKey.json",
    "title": "Get All ids with the meta data field",
    "name": "getAllIdsWithMetadataField",
    "group": "Meta",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "metaKey",
            "description": "<p>Unique meta key</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./meta.js",
    "groupTitle": "Meta"
  },
  {
    "type": "get",
    "url": "/revision/:rev/meta/findObjsWith/:metaKey.json",
    "title": "Get all meta data with field based on master branch",
    "name": "getAllIdsWithMetadataField",
    "group": "Meta",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "rev",
            "description": "<p>Revision to get meta data from</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "metaKey",
            "description": "<p>Unique meta key</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./meta.js",
    "groupTitle": "Meta"
  },
  {
    "type": "get",
    "url": "/revision/:rev/meta/findObjsWith/:metaKey.json",
    "title": "Get all meta data with field based on revision",
    "name": "getAllIdsWithMetadataField",
    "group": "Meta",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "rev",
            "description": "<p>Revision to get meta data from</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "metaKey",
            "description": "<p>Unique meta key</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./meta.js",
    "groupTitle": "Meta"
  },
  {
    "type": "get",
    "url": "/revision/master/head/meta/all.json",
    "title": "Get all meta data",
    "name": "getAllMetadata",
    "group": "Meta",
    "version": "0.0.0",
    "filename": "./meta.js",
    "groupTitle": "Meta"
  },
  {
    "type": "get",
    "url": "/revision/:rev/meta/all.json",
    "title": "Get all meta data",
    "name": "getAllMetadata",
    "group": "Meta",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "rev",
            "description": "<p>Revision to get meta data from</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./meta.js",
    "groupTitle": "Meta"
  },
  {
    "type": "get",
    "url": "/meta/:id.json",
    "title": "Get meta data",
    "name": "getMetadata",
    "group": "Meta",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "id",
            "description": "<p>Meta Unique ID</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./meta.js",
    "groupTitle": "Meta"
  },
  {
    "type": "post",
    "url": "/:model",
    "title": "Create a model",
    "name": "createModel",
    "group": "Model",
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "delete",
    "url": "/:model",
    "title": "Delete Model.",
    "name": "deleteModel",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to delete.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model/settings/heliSpeed",
    "title": "Get Model Heli Speed",
    "name": "getHeliSpeed",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to get Heli speed for.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model/revision/:rev/idMap.json",
    "title": "Get Tree Path",
    "name": "getIdMap",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to ID map for.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "rev",
            "description": "<p>Revision to use.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model/revision/master/head/idMap.json",
    "title": "Get ID Map",
    "name": "getIdMap",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to Get ID Map for.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model/revision/master/head/idToMeshes.json",
    "title": "Get ID Map",
    "name": "getIdToMeshes",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to get ID Meshes for.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model/revision/:rev/idToMeshes.json",
    "title": "Get ID Meshes",
    "name": "getIdToMeshes",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to use.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "rev",
            "description": "<p>Revision to use.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model/:uid.json.mpc",
    "title": "Get JSON Mpc",
    "name": "getJsonMpc",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to get JSON Mpc for.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Unique id for JSON mpc.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model/revision/master/head/modelProperties.json",
    "title": "Get ID Map",
    "name": "getModelProperties",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to get properties for.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model/revision/:rev/modelProperties.json",
    "title": "Get ID Meshes",
    "name": "getModelProperties",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to use.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "rev",
            "description": "<p>Revision to use.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model.json",
    "title": "Get Model Setting",
    "name": "getModelSetting",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "model",
            "description": "<p>Model to get settings for.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model/revision/master/head/fulltree.json",
    "title": "Get Model Tree",
    "name": "getModelTree",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to use.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model/revision/:rev/fulltree.json",
    "title": "Get ID Map",
    "name": "getModelTree",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to get Tree for.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "rev",
            "description": "<p>Revision to use.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/model/permissions",
    "title": "Get Multiple Model Permissions",
    "name": "getMultipleModelsPermissions",
    "group": "Model",
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model/permissions",
    "title": "Get Single Model Permissions",
    "name": "getSingleModelPermissions",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to get Permission for.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model/revision/master/head/tree_path.json",
    "title": "Get Model Tree path",
    "name": "getTreePath",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to get tree path for.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model/revision/:rev/tree_path.json",
    "title": "Get Tree Path",
    "name": "getTreePath",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to get tree path for.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "rev",
            "description": "<p>Revision to use.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model/revision/:rev/unityAssets.json",
    "title": "Get Unity Assets based on revision and model",
    "name": "getUnityAssets",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to get Unity Assets for.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "rev",
            "description": "<p>Revision to get Unity Assets for.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model/revision/master/head/unityAssets.json",
    "title": "Get Unity Assets based on model",
    "name": "getUnityAssets",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "unityAssets.json",
            "description": "<p>Model to get Unity Assets for.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model/:uid.unity3d",
    "title": "Get Unity Bundle",
    "name": "getUnityBundle",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to get JSON Mpc for.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Unique id for unity 3D</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model/revision/:rev/searchtree.json",
    "title": "Search model tree using revision and model to reference.",
    "name": "searchModelTree",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to use.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "rev",
            "description": "<p>Revision to use.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model/revision/master/head/searchtree.json",
    "title": "Search model tree using model as reference.",
    "name": "searchModelTree",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to use.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "put",
    "url": "/:model/settings/heliSpeed",
    "title": "Update Model Heli Speed",
    "name": "updateHeliSpeed",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to Update Heli speed.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "put",
    "url": "/:model",
    "title": "Update Federated Model",
    "name": "updateModel",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Federated Model to update</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "post",
    "url": "/model/permissions",
    "title": "Update Multiple Model Permissions",
    "name": "updateMultiplePermissions",
    "group": "Model",
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "post",
    "url": "/:model/permissions",
    "title": "Update Model Permissions",
    "name": "updatePermissions",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model Permission to update</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "put",
    "url": "/:model/settings/",
    "title": "Update Model Settings",
    "name": "updateSettings",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to update Settings.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "put",
    "url": "/:model/settings/",
    "title": "Update Model Settings",
    "name": "updateSettings",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to update Settings.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:model/download/latest",
    "title": "Upload Model.",
    "name": "uploadModel",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to download.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "post",
    "url": "/:model/revision/master/head/searchtree.json",
    "title": "Upload Model.",
    "name": "uploadModel",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to upload.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./model.js",
    "groupTitle": "Model"
  },
  {
    "type": "delete",
    "url": "/notifications",
    "title": "Delete All notification",
    "name": "deleteAllNotifications",
    "group": "Notification",
    "version": "0.0.0",
    "filename": "./notification.js",
    "groupTitle": "Notification"
  },
  {
    "type": "delete",
    "url": "/notifications/:id",
    "title": "Delete a notification",
    "name": "deleteNotification",
    "group": "Notification",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "id",
            "description": "<p>Unique Notification ID</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./notification.js",
    "groupTitle": "Notification"
  },
  {
    "type": "get",
    "url": "/notifications/:id",
    "title": "Get a notification",
    "name": "getNotification",
    "group": "Notification",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Unique Notification ID</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./notification.js",
    "groupTitle": "Notification"
  },
  {
    "type": "get",
    "url": "/notifications",
    "title": "Get all notifications",
    "name": "getNotifications",
    "group": "Notification",
    "version": "0.0.0",
    "filename": "./notification.js",
    "groupTitle": "Notification"
  },
  {
    "type": "patch",
    "url": "/notifications/:id",
    "title": "Patch a notification",
    "name": "patchNotification",
    "group": "Notification",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Unique Notification ID</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./notification.js",
    "groupTitle": "Notification"
  },
  {
    "type": "post",
    "url": "/paypal/ipn",
    "title": "Capture a pre-approve payment",
    "name": "executeAgreement",
    "group": "Payment",
    "version": "0.0.0",
    "filename": "./payment.js",
    "groupTitle": "Payment"
  },
  {
    "type": "post",
    "url": "/paypal/ipn",
    "title": "Create Paypal IPN message",
    "name": "handleIPN",
    "group": "Payment",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "id",
            "description": "<p>Unique Notification ID</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./payment.js",
    "groupTitle": "Payment"
  },
  {
    "type": "post",
    "url": "/permission-templates",
    "title": "Create a Permission Template",
    "name": "createTemplate",
    "group": "Permission_Template",
    "version": "0.0.0",
    "filename": "./permissionTemplate.js",
    "groupTitle": "Permission_Template"
  },
  {
    "type": "delete",
    "url": "/permission-templates/:permissionId",
    "title": "Delete permission template",
    "name": "deleteTemplate",
    "group": "Permission_Template",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "permissionId",
            "description": "<p>Unique Permission ID</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./permissionTemplate.js",
    "groupTitle": "Permission_Template"
  },
  {
    "type": "get",
    "url": "/permission-templates",
    "title": "List all Permission Templates",
    "name": "listTemplates",
    "group": "Permission_Template",
    "version": "0.0.0",
    "filename": "./permissionTemplate.js",
    "groupTitle": "Permission_Template"
  },
  {
    "type": "get",
    "url": "/:model/permission-templates",
    "title": "List all Permission Templates based on Model",
    "name": "listTemplates",
    "group": "Permission_Template",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model to get permission templates for.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./permissionTemplate.js",
    "groupTitle": "Permission_Template"
  },
  {
    "type": "get",
    "url": "/plans",
    "title": "List all Plans",
    "name": "listPlans",
    "group": "Plan",
    "version": "0.0.0",
    "filename": "./plan.js",
    "groupTitle": "Plan"
  },
  {
    "type": "post",
    "url": "/projects",
    "title": "Create a project",
    "name": "createProject",
    "group": "Project",
    "version": "0.0.0",
    "filename": "./project.js",
    "groupTitle": "Project"
  },
  {
    "type": "delete",
    "url": "/projects/:project",
    "title": "Delete a project",
    "name": "deleteProject",
    "group": "Project",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "project",
            "description": "<p>Project to delete</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./project.js",
    "groupTitle": "Project"
  },
  {
    "type": "get",
    "url": "/projects/:project",
    "title": "List a project",
    "name": "listProject",
    "group": "Project",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "project",
            "description": "<p>Project to list</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./project.js",
    "groupTitle": "Project"
  },
  {
    "type": "get",
    "url": "/projects",
    "title": "List all projects",
    "name": "listProjects",
    "group": "Project",
    "version": "0.0.0",
    "filename": "./project.js",
    "groupTitle": "Project"
  },
  {
    "type": "put",
    "url": "/projects/:project",
    "title": "Update a project",
    "name": "updateProject",
    "group": "Project",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "project",
            "description": "<p>Project to update</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./project.js",
    "groupTitle": "Project"
  },
  {
    "type": "get",
    "url": "/revisions.json",
    "title": "List all revisions",
    "name": "listRevisions",
    "group": "Revisions",
    "version": "0.0.0",
    "filename": "./history.js",
    "groupTitle": "Revisions"
  },
  {
    "type": "get",
    "url": "/revisions/:branch.json",
    "title": "List all revisions by branch",
    "name": "listRevisionsByBranch",
    "group": "Revisions",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "branch.json",
            "description": "<p>Branch required to list revisions for.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./history.js",
    "groupTitle": "Revisions"
  },
  {
    "type": "put",
    "url": "/revisions/:id/tag",
    "title": "Update Revision Tag",
    "name": "updateRevisionTag",
    "group": "Revisions",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Unique Revision ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "tag",
            "description": "<p>Tag to update</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./history.js",
    "groupTitle": "Revisions"
  },
  {
    "type": "delete",
    "url": "/risks/",
    "title": "Delete risks",
    "name": "deleteRisks",
    "group": "Risks",
    "version": "0.0.0",
    "filename": "./risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "get",
    "url": "/risks/:uid.json",
    "title": "Find Risk by ID",
    "name": "findRiskById",
    "group": "Risks",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Risk unique ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "get",
    "url": "/risks/:uid/screenshot.png",
    "title": "Get Risks Screenshot",
    "name": "getScreenshot",
    "group": "Risks",
    "version": "0.0.0",
    "filename": "./risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "get",
    "url": "/risks/:uid/screenshotSmall.png",
    "title": "Get Small Risks Screenshot",
    "name": "getScreenshotSmall",
    "group": "Risks",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Risk unique ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "get",
    "url": "/risks/:uid/thumbnail.png",
    "title": "Get Risks Thumbnail",
    "name": "getThumbnail",
    "group": "Risks",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Risk unique ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "get",
    "url": "/risks.json",
    "title": "List All Risks",
    "name": "listRisks",
    "group": "Risks",
    "version": "0.0.0",
    "filename": "./risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "get",
    "url": "/risks/:rid/risks.json",
    "title": "List all Risks by revision ID",
    "name": "listRisks",
    "group": "Risks",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Revision unique ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "get",
    "url": "/risks.html",
    "title": "Render all Risks as HTML by revision ID",
    "name": "renderRisksHTML",
    "group": "Risks",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Revision unique ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "get",
    "url": "/risks.html",
    "title": "Render all Risks as HTML",
    "name": "renderRisksHTML",
    "group": "Risks",
    "version": "0.0.0",
    "filename": "./risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "post",
    "url": "/risks.json",
    "title": "Store Risks",
    "name": "storeRisk",
    "group": "Risks",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Revision unique ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "post",
    "url": "/revision/:rid/risks.json",
    "title": "Store risks based on Revision ID",
    "name": "storeRisk",
    "group": "Risks",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "rid",
            "description": "<p>Revision unique ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "put",
    "url": "/revision/:rid/risks/:riskId.json",
    "title": "Update Risk based on revision ID",
    "name": "updateRisk",
    "group": "Risks",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "rid",
            "description": "<p>Revision unique ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "put",
    "url": "/risks/riskId.json",
    "title": "Update risks based on revision",
    "name": "updateRisk",
    "group": "Risks",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "riskId.json",
            "description": "<p>Risk unique ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "get",
    "url": "/subscriptions",
    "title": "List all subscriptions",
    "name": "listSubscriptions",
    "group": "Subscription",
    "version": "0.0.0",
    "filename": "./subscriptions.js",
    "groupTitle": "Subscription"
  },
  {
    "type": "get",
    "url": "/subscriptions",
    "title": "Update a subscription",
    "name": "updateSubscription",
    "group": "Subscription",
    "version": "0.0.0",
    "filename": "./subscriptions.js",
    "groupTitle": "Subscription"
  },
  {
    "type": "post",
    "url": "/members",
    "title": "Create a Team Member",
    "name": "addTeamMember",
    "group": "Teamspace",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "searchString",
            "description": "<p>Search string required to find team member.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "Team",
            "description": "<p>member profile</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "User",
            "description": "<p>not found The <code>searchString</code> of the User was not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "{",
          "content": "{\n\t\t\"message\": \"User not found\",\n\t\t\"status\": 404,\n\t\t\"code\": \"USER_NOT_FOUND\",\n\t\t\"value\": 1,\n\t\t\"place\": \"POST /members\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./teamspace.js",
    "groupTitle": "Teamspace"
  },
  {
    "type": "get",
    "url": "/members/search/:searchString",
    "title": "Search for a member without a membership",
    "name": "findUsersWithoutMembership",
    "group": "Teamspace",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "searchString",
            "description": "<p>Search string provided to find member</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./teamspace.js",
    "groupTitle": "Teamspace"
  },
  {
    "type": "get",
    "url": "/members",
    "title": "Get Member List",
    "name": "getMemberList",
    "group": "Teamspace",
    "version": "0.0.0",
    "filename": "./teamspace.js",
    "groupTitle": "Teamspace"
  },
  {
    "type": "get",
    "url": "/quota",
    "title": "Get Quota Information",
    "name": "getQuotaInfo",
    "group": "Teamspace",
    "version": "0.0.0",
    "filename": "./teamspace.js",
    "groupTitle": "Teamspace"
  },
  {
    "type": "delete",
    "url": "/members/:user",
    "title": "Remove a team member",
    "name": "removeTeamMember",
    "group": "Teamspace",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "user",
            "description": "<p>User (Member) to remove</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./teamspace.js",
    "groupTitle": "Teamspace"
  },
  {
    "type": "post",
    "url": "/viewpoints/",
    "title": "Create a Viewpoint",
    "name": "createViewpoint",
    "group": "Viewpoint",
    "version": "0.0.0",
    "filename": "./viewpoint.js",
    "groupTitle": "Viewpoint"
  },
  {
    "type": "delete",
    "url": "/viewpoints/:uid",
    "title": "Delete a Viewpoint",
    "name": "deleteViewpoint",
    "group": "Viewpoint",
    "version": "0.0.0",
    "filename": "./viewpoint.js",
    "groupTitle": "Viewpoint"
  },
  {
    "type": "get",
    "url": "/viewpoints/:uid",
    "title": "Find a Viewpoint",
    "name": "findViewpoint",
    "group": "Viewpoint",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Unique Viewpoint ID</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./viewpoint.js",
    "groupTitle": "Viewpoint"
  },
  {
    "type": "get",
    "url": "/viewpoints/:uid",
    "title": "Get a Viewpoint Thumbnail",
    "name": "getViewpointThumbnail",
    "group": "Viewpoint",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Unique Viewpoint ID</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./viewpoint.js",
    "groupTitle": "Viewpoint"
  },
  {
    "type": "get",
    "url": "/viewpoints",
    "title": "List all Viewpoints",
    "name": "listViewpoints",
    "group": "Viewpoint",
    "version": "0.0.0",
    "filename": "./viewpoint.js",
    "groupTitle": "Viewpoint"
  },
  {
    "type": "put",
    "url": "/viewpoints/:uid",
    "title": "Update a Viewpoint",
    "name": "updateViewpoint",
    "group": "Viewpoint",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Unique Viewpoint ID</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "./viewpoint.js",
    "groupTitle": "Viewpoint"
  }
] });
