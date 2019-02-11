define({ "api": [
  {
    "type": "post",
    "url": "/:teamspace/permissions/",
    "title": "Create a permission",
    "name": "createPermission",
    "group": "Account_Permission",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          }
        ]
      }
    },
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
          "content": " HTTP/1.1 200 OK\n\t[\n\t   {\n\t\t \"user\": \"username1\",\n\t\t \"permissions\": [\n\t\t\t \"permission_type\"\n\t\t ]\n\t   }\n\t]",
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
          "content": "HTTP/1.1 400 Bad Request\n\t{\n\t  \"message\": \"Missing or invalid arguments\",\n\t  \"status\": 400,\n\t  \"code\": \"INVALID_ARGUMENTS\",\n\t  \"value\": 10,\n\t  \"place\": \"POST /permissions\"\n\t}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/accountPermission.js",
    "groupTitle": "Account_Permission"
  },
  {
    "type": "delete",
    "url": "/:teamspace/permissions/:user",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
          "content": "\nHTTP/1.1 401 Unauth­orized\n\t{\n\t  \"message\": \"Missing or invalid arguments\",\n\t  \"status\": 401,\n\t  \"code\": \"NOT_AUTHORIZED\",\n\t  \"value\": 9,\n\t  \"place\": \"GET /permissions\"\n\t}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/accountPermission.js",
    "groupTitle": "Account_Permission"
  },
  {
    "type": "get",
    "url": "/:teamspace/permissions/",
    "title": "List all permissions",
    "name": "listPermissions",
    "group": "Account_Permission",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          }
        ]
      }
    },
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
          "content": " HTTP/1.1 200 OK\n\t[\n\t   {\n\t\t \"user\": \"username\",\n\t\t \"permissions\": [\n\t\t\t \"teamspace_admin\"\n\t\t ]\n\t   }\n\t]",
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
          "content": "HTTP/1.1 401 Unauthorized\n\t{\n\t  \"message\": \"Not Authorized\",\n\t  \"status\": 401,\n\t  \"code\": \"NOT_AUTHORIZED\",\n\t  \"value\": 9,\n\t  \"place\": \"GET /permissions\"\n\t}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/accountPermission.js",
    "groupTitle": "Account_Permission"
  },
  {
    "type": "put",
    "url": "/:teamspace/permissions/:user",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
          "content": "\nHTTP/1.1 200 OK\n[\n\t {\n\t  \"model\": \"model_ID\",\n\t  \"name\": \"model_name\",\n\t  \"permissions\": [\n\t\t  {\n\t\t\t  \"user\": \"username1\"\n\t\t  },\n\t\t  {\n\t\t\t  \"user\": \"username2\"\n\t\t  }\n\t  ],\n\t  \"subModels\": []\n\t }\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/accountPermission.js",
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
          "content": "HTTP/1.1 200 OK\n{\n\t\"account\":\"newAccountUsername\"\n}",
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
          "content": "\nHTTP/1.1 400 Bad Request\n{\n\t \"message\": \"Password is missing\",\n\t \"status\": 400,\n\t \"code\": \"SIGN_UP_PASSWORD_MISSING\",\n\t \"value\": 57,\n\t \"place\": \"POST /nabile\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/auth.js",
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
          "content": "HTTP/1.1 200 OK\n\t{\n\t \"username\": \"username1\",\n\t \"roles\": [\n\t\t {\n\t\t\t \"role\": \"team_member\",\n\t\t\t \"db\": \"database_name\"\n\t\t },\n\t\t {\n\t\t\t \"role\": \"team_member\",\n\t\t\t \"db\": \"database_name1\"\n\t\t },\n\t\t {\n\t\t\t \"role\": \"team_member\",\n\t\t\t \"db\": \"database_name2\"\n\t\t }\n\t ],\n\t \"flags\": {\n\t\t \"termsPrompt\": false\n\t }\n\t}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/auth.js",
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
          "content": "\nHTTP/1.1 400 Bad Request\n{\n\t \"message\": \"Password is missing\",\n\t \"status\": 400,\n\t \"code\": \"SIGN_UP_PASSWORD_MISSING\",\n\t \"value\": 57,\n\t \"place\": \"POST /forgotPassword\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/auth.js",
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
          "content": "\nHTTP/1.1 404 Not Found\n{\n\t \"message\": \"User does not have an avatar\",\n\t \"status\": 404,\n\t \"code\": \"SIGN_UP_PASSWORD_MISSING\",\n\t \"place\": \"POST /:account/avatar\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/auth.js",
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
          "content": "HTTP/1.1 200 OK\n{\n\t\"accounts\": [\n\t\t{\n\t\t\t\"account\": \"username1\",\n\t\t\t\"projects\": [\n\t\t\t\t{\n\t\t\t\t\t\"_id\": \"model_ID\",\n\t\t\t\t\t\"name\": \"Sample_Project\",\n\t\t\t\t\t\"__v\": 37,\n\t\t\t\t\t\"permissions\": [\n\t\t\t\t\t\t\"create_model\",\n\t\t\t\t\t\t\"create_federation\",\n\t\t\t\t\t\t\"admin_project\",\n\t\t\t\t\t\t\"edit_project\",\n\t\t\t\t\t\t\"delete_project\",\n\t\t\t\t\t\t\"upload_files_all_models\",\n\t\t\t\t\t\t\"edit_federation_all_models\",\n\t\t\t\t\t\t\"create_issue_all_models\",\n\t\t\t\t\t\t\"comment_issue_all_models\",\n\t\t\t\t\t\t\"view_issue_all_models\",\n\t\t\t\t\t\t\"view_model_all_models\",\n\t\t\t\t\t\t\"download_model_all_models\",\n\t\t\t\t\t\t\"change_model_settings_all_models\"\n\t\t\t\t\t],\n\t\t\t\t\t\"models\": [\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\"permissions\": [\n\t\t\t\t\t\t\t\t\"change_model_settings\",\n\t\t\t\t\t\t\t\t\"upload_files\",\n\t\t\t\t\t\t\t\t\"create_issue\",\n\t\t\t\t\t\t\t\t\"comment_issue\",\n\t\t\t\t\t\t\t\t\"view_issue\",\n\t\t\t\t\t\t\t\t\"view_model\",\n\t\t\t\t\t\t\t\t\"download_model\",\n\t\t\t\t\t\t\t\t\"edit_federation\",\n\t\t\t\t\t\t\t\t\"delete_federation\",\n\t\t\t\t\t\t\t\t\"delete_model\",\n\t\t\t\t\t\t\t\t\"manage_model_permission\"\n\t\t\t\t\t\t\t],\n\t\t\t\t\t\t\t\"model\": \"model_ID_1\",\n\t\t\t\t\t\t\t\"name\": \"Model_Name_1\",\n\t\t\t\t\t\t\t\"status\": \"ok\",\n\t\t\t\t\t\t\t\"timestamp\": \"2018-11-27T09:59:56.470Z\"\n\t\t\t\t\t\t},\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\"permissions\": [\n\t\t\t\t\t\t\t\t\"change_model_settings\",\n\t\t\t\t\t\t\t\t\"upload_files\",\n\t\t\t\t\t\t\t\t\"create_issue\",\n\t\t\t\t\t\t\t\t\"comment_issue\",\n\t\t\t\t\t\t\t\t\"view_issue\",\n\t\t\t\t\t\t\t\t\"view_model\",\n\t\t\t\t\t\t\t\t\"download_model\",\n\t\t\t\t\t\t\t\t\"edit_federation\",\n\t\t\t\t\t\t\t\t\"delete_federation\",\n\t\t\t\t\t\t\t\t\"delete_model\",\n\t\t\t\t\t\t\t\t\"manage_model_permission\"\n\t\t\t\t\t\t\t],\n\t\t\t\t\t\t\t\"model\": \"model_ID_2\",\n\t\t\t\t\t\t\t\"name\": \"Model_Name_2\",\n\t\t\t\t\t\t\t\"status\": \"ok\",\n\t\t\t\t\t\t\t\"timestamp\": \"2018-11-27T09:57:19.345Z\"\n\t\t\t\t\t\t},\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\"permissions\": [\n\t\t\t\t\t\t\t\t\"change_model_settings\",\n\t\t\t\t\t\t\t\t\"upload_files\",\n\t\t\t\t\t\t\t\t\"create_issue\",\n\t\t\t\t\t\t\t\t\"comment_issue\",\n\t\t\t\t\t\t\t\t\"view_issue\",\n\t\t\t\t\t\t\t\t\"view_model\",\n\t\t\t\t\t\t\t\t\"download_model\",\n\t\t\t\t\t\t\t\t\"edit_federation\",\n\t\t\t\t\t\t\t\t\"delete_federation\",\n\t\t\t\t\t\t\t\t\"delete_model\",\n\t\t\t\t\t\t\t\t\"manage_model_permission\"\n\t\t\t\t\t\t\t],\n\t\t\t\t\t\t\t\"model\": \"model_ID_3\",\n\t\t\t\t\t\t\t\"name\": \"Model_Name_3\",\n\t\t\t\t\t\t\t\"status\": \"ok\",\n\t\t\t\t\t\t\t\"timestamp\": \"2018-11-26T17:19:26.175Z\"\n\t\t\t\t\t\t},\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\"permissions\": [\n\t\t\t\t\t\t\t\t\"change_model_settings\",\n\t\t\t\t\t\t\t\t\"upload_files\",\n\t\t\t\t\t\t\t\t\"create_issue\",\n\t\t\t\t\t\t\t\t\"comment_issue\",\n\t\t\t\t\t\t\t\t\"view_issue\",\n\t\t\t\t\t\t\t\t\"view_model\",\n\t\t\t\t\t\t\t\t\"download_model\",\n\t\t\t\t\t\t\t\t\"edit_federation\",\n\t\t\t\t\t\t\t\t\"delete_federation\",\n\t\t\t\t\t\t\t\t\"delete_model\",\n\t\t\t\t\t\t\t\t\"manage_model_permission\"\n\t\t\t\t\t\t\t],\n\t\t\t\t\t\t\t\"model\": \"mode_ID_4\",\n\t\t\t\t\t\t\t\"name\": \"Model_Name_4\",\n\t\t\t\t\t\t\t\"status\": \"queued\",\n\t\t\t\t\t\t\t\"timestamp\": null\n\t\t\t\t\t\t}\n\t\t\t\t\t]\n\t\t\t\t},\n\t\t\t\t{\n\t\t\t\t\t\"_id\": \"model_ID_3\",\n\t\t\t\t\t\"name\": \"Model_Name_4\",\n\t\t\t\t\t\"__v\": 2,\n\t\t\t\t\t\"permissions\": [\n\t\t\t\t\t\t\"create_model\",\n\t\t\t\t\t\t\"create_federation\",\n\t\t\t\t\t\t\"admin_project\",\n\t\t\t\t\t\t\"edit_project\",\n\t\t\t\t\t\t\"delete_project\",\n\t\t\t\t\t\t\"upload_files_all_models\",\n\t\t\t\t\t\t\"edit_federation_all_models\",\n\t\t\t\t\t\t\"create_issue_all_models\",\n\t\t\t\t\t\t\"comment_issue_all_models\",\n\t\t\t\t\t\t\"view_issue_all_models\",\n\t\t\t\t\t\t\"view_model_all_models\",\n\t\t\t\t\t\t\"download_model_all_models\",\n\t\t\t\t\t\t\"change_model_settings_all_models\"\n\t\t\t\t\t],\n\t\t\t\t\t\"models\": [\n\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\"permissions\": [\n\t\t\t\t\t\t\t\t\"change_model_settings\",\n\t\t\t\t\t\t\t\t\"upload_files\",\n\t\t\t\t\t\t\t\t\"create_issue\",\n\t\t\t\t\t\t\t\t\"comment_issue\",\n\t\t\t\t\t\t\t\t\"view_issue\",\n\t\t\t\t\t\t\t\t\"view_model\",\n\t\t\t\t\t\t\t\t\"download_model\",\n\t\t\t\t\t\t\t\t\"edit_federation\",\n\t\t\t\t\t\t\t\t\"delete_federation\",\n\t\t\t\t\t\t\t\t\"delete_model\",\n\t\t\t\t\t\t\t\t\"manage_model_permission\"\n\t\t\t\t\t\t\t],\n\t\t\t\t\t\t\t\"model\": \"model_ID_5\",\n\t\t\t\t\t\t\t\"name\": \"model\",\n\t\t\t\t\t\t\t\"status\": \"queued\",\n\t\t\t\t\t\t\t\"timestamp\": \"2018-11-22T15:47:57.000Z\"\n\t\t\t\t\t\t}\n\t\t\t\t\t]\n\t\t\t\t}\n\t\t\t],\n\t\t\t\"models\": [],\n\t\t\t\"fedModels\": [],\n\t\t\t\"isAdmin\": true,\n\t\t\t\"permissions\": [\n\t\t\t\t\"assign_licence\",\n\t\t\t\t\"revoke_licence\",\n\t\t\t\t\"teamspace_admin\",\n\t\t\t\t\"create_project\",\n\t\t\t\t\"create_job\",\n\t\t\t\t\"delete_job\",\n\t\t\t\t\"assign_job\",\n\t\t\t\t\"view_projects\"\n\t\t\t]\n\t\t}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/auth.js",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
          "content": "HTTP/1.1 200 OK\n\t{\n\t \"username\": \"username1\",\n\t \"roles\": [\n\t\t {\n\t\t\t \"role\": \"team_member\",\n\t\t\t \"db\": \"database_name\"\n\t\t },\n\t\t {\n\t\t\t \"role\": \"team_member\",\n\t\t\t \"db\": \"database_name1\"\n\t\t },\n\t\t {\n\t\t\t \"role\": \"team_member\",\n\t\t\t \"db\": \"database_name2\"\n\t\t }\n\t ],\n\t \"flags\": {\n\t\t \"termsPrompt\": false\n\t }\n\t}",
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
          "content": "\nHTTP/1.1 401 Unauth­orized\n\t {\n\t   \"message\": \"Not Authorized\",\n\t   \"status\": 401,\n\t   \"code\": \"NOT_AUTHORIZED\",\n\t   \"value\": 9,\n\t   \"place\": \"GET /login\"\n\t }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/auth.js",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
          "content": "HTTP/1.1 200 OK\n{\n\t\"username\": \"username1\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/auth.js",
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
          "content": "HTTP/1.1 200 OK\n{\n\t \"VERSION\": \"2.20.1\",\n\t \"unity\": {\n\t\t \"current\": \"2.20.0\",\n\t\t \"supported\": []\n\t  },\n\t \"navis\": {\n\t\t \"current\": \"2.16.0\",\n\t\t \"supported\": [\n\t\t\t \"2.8.0\"\n\t\t ]\n\t },\n\t \"unitydll\": {\n\t\t \"current\": \"2.8.0\",\n\t\t \"supported\": []\n\t }\n\t}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/auth.js",
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
          "content": "HTTP/1.1 200 OK\n{\n\"account\":\"username1\"\n}",
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
    "filename": "routes/auth.js",
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
          "content": "HTTP/1.1 200 OK\n{\n\t\"account\":\"newAccountUsername\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/auth.js",
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
          "content": "HTTP/1.1 200 OK\n{\n\t\"status\":\"success\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/auth.js",
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
          "content": "\nHTTP/1.1 400 Bad Request\n{\n\t \"message\": \"Already verified\",\n\t \"status\": 400,\n\t \"code\": \"ALREADY_VERIFIED\",\n\t \"value\": 60,\n\t \"place\": \"POST /niblux/verify\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/auth.js",
    "groupTitle": "Authorisation"
  },
  {
    "type": "post",
    "url": "/:teamspace/:model/groups/",
    "title": "Create a group",
    "name": "createGroup",
    "description": "<p>Add a group to the model.</p>",
    "group": "Groups",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
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
            "field": "Group",
            "description": "<p>Created</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": "HTTP/1.1 200 OK\n{\n\t\t\"__v\":0,\n\t\t\"_id\":\"efa67a80-0fab-11e9-a0ed-edada3f501fd\",\n\t\t\"name\":\"Group 1\",\"description\":\"\",\n\t\t\"author\":\"username\",\n\t\t\"updatedBy\":\"username\",\n\t\t\"updatedAt\":\"2019-01-03T23:03:37.411Z\",\n\t\t\"createdAt\":\"2019-01-03T23:03:37.411Z\",\n\t\t\"color\":[44,50,125],\n\t\t\"objects\":[]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/group.js",
    "groupTitle": "Groups"
  },
  {
    "type": "delete",
    "url": "/:teamspace/:model/groups/",
    "title": "Delete groups",
    "name": "deleteGroups",
    "description": "<p>Delete single group using unique group ID.</p>",
    "group": "Groups",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
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
            "field": "Status",
            "description": "<p>success</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": "\nHTTP/1.1 200 OK\n{\n\t\"status\":\"success\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/group.js",
    "groupTitle": "Groups"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/groups/revision/master/head/:uid/",
    "title": "Find group in model",
    "description": "<p>Find a group using it's Group ID</p>",
    "name": "findGroup",
    "group": "Groups",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "Group",
            "description": "<p>matching provided ID.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": "\nHTTP/1.1 200 OK\n{\n\t\"_id\": \"group_ID\",\n\t\"color\": [\n\t\t121,\n\t\t130,\n\t\t211\n\t],\n\t\"objects\": []\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/group.js",
    "groupTitle": "Groups"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/groups/revision/:rid/:uid/",
    "title": "Find group in model by revision",
    "name": "findGroupByRevision",
    "description": "<p>Find a single group using the unique Group ID and a Revision ID.</p>",
    "group": "Groups",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "Group",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": "\nHTTP/1.1 200 OK\n[\n\t\t{\n\t\t\t\"_id\": \"789b2ed0-0f7f-11e9-b909-833ae21f045f\",\n\t\t\t\"name\": \"Group 1\",\n\t\t\t\"description\": \"This is test group for revision 2\",\n\t\t\t\"author\": \"username\",\n\t\t\t\"updatedBy\": \"username\",\n\t\t\t\"updatedAt\": 1546553617888,\n\t\t\t\"createdAt\": 1546537564888,\n\t\t\t\"__v\": 0,\n\t\t\t\"color\": [\n\t\t\t\t121,\n\t\t\t\t130,\n\t\t\t\t211\n\t\t\t],\n\t\t\t\"objects\": [\n\t\t\t\t\t{\n\t\t\t\t\t\t\"account\": \"account_username\",\n\t\t\t\t\t\t\"model\": \"6e7d81fb-85c8-4b09-9ad6-6ba099261099\",\n\t\t\t\t\t\t\"ifc_guids\": [],\n\t\t\t\t\t\t\"shared_ids\": [\n\t\t\t\t\t\t\"24fdcf2d-b9eb-4fa2-a614-dfe2532493b3\",\n\t\t\t\t\t\t\"db18ef69-6d6e-49a0-846e-907346abb39d\",\n\t\t\t\t\t\t\"c532ff34-6669-4807-b7f3-6a0ffb17b027\",\n\t\t\t\t\t\t\"fec16ea6-bb7b-4f12-b39b-f06fe6bf041d\",\n\t\t\t\t\t\t\"3f881fa8-2b7b-443e-920f-396c1c85e903\"\n\t\t\t\t\t]\n\t\t\t\t}\n\t\t\t]\n\t\t}\n\t]",
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
            "field": "GROUP_NOT_FOUND",
            "description": "<p>Group Not Found</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response",
          "content": "\nHTTP/1.1 404 Not Found\n\t{\n\t  \"message\": \"Group not found\",\n\t  \"status\": 404,\n\t  \"code\": \"GROUP_NOT_FOUND\",\n\t  \"value\": 53,\n\t  \"place\": \"PUT /groups/revision\"\n\t}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/group.js",
    "groupTitle": "Groups"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/groups/revision/master/head/",
    "title": "List model groups",
    "name": "listGroups",
    "group": "Groups",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          }
        ]
      }
    },
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
    "filename": "routes/group.js",
    "groupTitle": "Groups"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/groups/revision/:rid/",
    "title": "List model groups by revision",
    "description": "<p>List all groups using based on which revision is currently selected.</p>",
    "name": "listGroupsByRevision",
    "group": "Groups",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object[]",
            "optional": false,
            "field": "List",
            "description": "<p>of all Groups based on Revision ID.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": "\nHTTP/1.1 200 OK\n[\n\t{\n\t\t\"_id\": \"model_ID\",\n\t\t\"name\": \"Group 1\",\n\t\t\"description\": \"This is test group for revision 2\",\n\t\t\"author\": \"username\",\n\t\t\"updatedBy\": \"username\",\n\t\t\"updatedAt\": 1546537564888,\n\t\t\"createdAt\": 1546537564888,\n\t\t\"__v\": 0,\n\t\t\"color\": [\n\t\t121,\n\t\t130,\n\t\t211\n\t],\n\t\t\"objects\": []\n\t}\n\t]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/group.js",
    "groupTitle": "Groups"
  },
  {
    "type": "put",
    "url": "/:teamspace/:model/groups/:uid/",
    "title": "Update group",
    "name": "updateGroup",
    "group": "Groups",
    "description": "<p>Update a specific group using a unique group ID.</p>",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "Group",
            "description": "<p>Object</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": "HTTP/1.1 200 OK\n{\n\t \"_id\":\"c5f0fd00-0fab-11e9-bf22-eb8649763304\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "GROUP_NOT_FOUND",
            "description": "<p>Group Not Found</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response",
          "content": "\nHTTP/1.1 404 Not Found\n\t{\n\t  \"message\": \"Group not found\",\n\t  \"status\": 404,\n\t  \"code\": \"GROUP_NOT_FOUND\",\n\t  \"value\": 53,\n\t  \"place\": \"PUT /groups/\"\n\t}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/group.js",
    "groupTitle": "Groups"
  },
  {
    "type": "get",
    "url": "/:teamspace/invoices",
    "title": "List all invoices",
    "name": "listInvoices",
    "group": "Invoice",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          }
        ]
      }
    },
    "description": "<p>List all invoices if available, to current logged in user.</p>",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "Invoice",
            "description": "<p>Object</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": "HTTP/1.1 200 OK\n[\n\t{\n\t\"_id\":\"invoice_ID\",\n\t\"invoiceNo\":\"AA-111\",\n\t\"nextPaymentAmount\":00,\n\t\"taxAmount\":0,\n\t\"amount\":00,\n\t\"currency\":\"GBP\",\n\t\"transactionId\":\"transaction_ID\",\n\t\"gateway\":\"GATEWAY_PROVIDER\",\n\t\"billingAgreementId\":\"billing_agreement_ID\",\n\t\"periodEnd\":\"2018-06-03\",\n\t\"periodStart\":\"2018-05-04\",\n\t  \"info\":\n\t\t{\n\t\t  \"vat\":\"\",\n\t\t  \"countryCode\":\"AO\",\n\t\t  \"postalCode\":\"SW11 1BQ\",\n\t\t  \"city\":\"London\",\n\t\t  \"line2\":\"1 Street Road\",\n\t\t  \"line1\":\"London\",\n\t\t  \"company\":\"Comapny\",\n\t\t  \"lastName\":\"User Lastname\",\n\t\t  \"firstName\":\"User Firstname\",\n\t\t  \"_id\":\"invoice_ID\",\n\t\t  \"countryName\":\"United Kingdom\"\n\t\t},\n\t \"nextPaymentDate\":\"2018-06-04\",\n\t \"createdAt\":\"04-05-2018 15:59\",\n\t \"__v\":0,\"state\":\"complete\",\n\t \"items\":\n\t\t[{\n\t\t\t \"name\":\"pricingPlanName\",\n\t\t\t\"currency\":\"GBP\",\n\t\t\t\"amount\":00,\n\t\t\t\"taxAmount\":0,\n\t\t\t\"_id\":\"invoice_ID\",\n\t\t\t\"description\":\"Advance License (from 2018)\",\n\t\t\t\"id\":\"invoice_ID\"},\n\t\t\t  {\n\t\t\t\t\"name\":\"pricingPlanName\",\n\t\t\t\t\"currency\":\"GBP\",\n\t\t\t\t\"amount\":29,\n\t\t\t\t\"taxAmount\":0,\n\t\t\t\t\"_id\":\"invoice_ID\",\n\t\t\t\t\"description\":\"This is a dummy invoice for use with API Documentation\",\n\t\t\t\t\"id\":\"invoice_ID\"\n\t\t}],\n\t\t\t\t\"type\":\"invoice\",\n\t\t\t\t\"proRata\":false,\n\t\t\t\t\"pending\":false,\n\t\t\t\t\"unitPrice\":\"29.00\",\n\t\t\t\t\"B2B_EU\":false,\n\t\t\t\t\"taxPercentage\":0,\n\t\t\t\t\"createdAtDate\":\"2018-05-04\",\n\t\t\t\t\"netAmount\":00\n\t}\n]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "401": [
          {
            "group": "401",
            "optional": false,
            "field": "NOT_AUTHORIZED",
            "description": "<p>Not Authorized</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response",
          "content": "\nHTTP/1.1 401 Not Authorized\n{\n\t\"message\":\"Not Authorized\",\n\t\"status\":401,\"code\":\n\t\"NOT_AUTHORIZED\",\n\t\"value\":9,\n\t\"place\":\"GET /nabile/subscriptions\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/invoice.js",
    "groupTitle": "Invoice"
  },
  {
    "type": "get",
    "url": "/:teamspace/invoices/:invoiceNo.html",
    "title": "Render invoices as HTML",
    "name": "renderInvoice",
    "group": "Invoice",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "invoiceNo",
            "description": "<p>Invoice number to render.</p>"
          }
        ]
      }
    },
    "description": "<p>Render a HTML web page of the requested invoice.</p>",
    "version": "0.0.0",
    "filename": "routes/invoice.js",
    "groupTitle": "Invoice"
  },
  {
    "type": "get",
    "url": "/:teamspace/invoices/:invoiceNo.pdf",
    "title": "Render invoices as PDF",
    "name": "renderInvoicePDF",
    "group": "Invoice",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "invoiceNo.pdf",
            "description": "<p>Invoice to render.</p>"
          }
        ]
      }
    },
    "description": "<p>Render out a PDF version of the requested invocie.</p>",
    "version": "0.0.0",
    "filename": "routes/invoice.js",
    "groupTitle": "Invoice"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/issues.bcfzip",
    "title": "Get Issue Screenshot",
    "name": "getScreenshot",
    "group": "Issue_",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "description": "<p>Get an issue screenshot from viewpoints using a viewpoint ID and issue ID.</p>",
    "version": "0.0.0",
    "filename": "routes/issue.js",
    "groupTitle": "Issue_"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/issues/analytics.:format",
    "title": "Get Issue Analytics",
    "name": "getIssueAnalytics",
    "group": "Issues_Analytics",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "filename": "routes/issueAnalytic.js",
    "groupTitle": "Issues_Analytics"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/issues/:uid.json",
    "title": "Find Issue by ID",
    "name": "findIssueById",
    "group": "Issues",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>Issue ID.</p>"
          }
        ]
      }
    },
    "description": "<p>Find an issue with the requested Issue ID.</p>",
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
          "title": "Success-Response.",
          "content": "HTTP/1.1 200 OK\n{\n\t\taccount: \"username\"\n\t\tassigned_roles: []\n\t\tcommentCount: 0\n\t\tcreated: 1542723030489\n\t\tcreator_role: \"3D Repo\"\n\t\tdesc: \"(No Description)\"\n\t\tmodel: \"model_ID\"\n\t\tmodelCode: \"\"\n\t\tname: \"Issue one\"\n\t\tnorm: []\n\t\tnumber: 1\n\t\towner: \"username\"\n\t\tposition: []\n\t\tpriority: \"none\"\n\t\trev_id: \"revision_ID\"\n\t\tscale: 1\n\t\tstatus: \"open\"\n\t\tthumbnail: \"USERNAME/MODEL_ID/issues/ISSUE_ID/thumbnail.png\"\n\t\ttopic_type: \"for_information\"\n\t\ttypePrefix: \"Architectural\"\n\t\tviewCount: 1\n\t\tviewpoint: {near: 24.057758331298828, far: 12028.87890625, fov: 1.0471975803375244,…}\n\t\t__v: 0\n\t\t_id: \"ISSUE_ID\"\n}",
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
            "field": "ISSUE_NOT_FOUND",
            "description": "<p>Issue not found</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "HTTP/1.1 404 Not Found",
          "content": "HTTP/1.1 404 Not Found\n{\n\t \"place\": \"GET /issues/issue_ID.json\",\n\t \"status\": 500,\n\t \"message\": \"Issue not found\",\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/issues/:uid.json",
    "title": "Get Issue Thumbnail",
    "name": "findIssueById",
    "group": "Issues",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "description": "<p>Retrieve thumbnail screenshot image for requested issue.</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "200",
            "description": "<p>{Object} thumbnail Thumbnail Image</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/issues.bcfzip",
    "title": "Get Issues BCF zip file",
    "name": "getIssuesBCF",
    "group": "Issues",
    "description": "<p>Get a downloaded zip file of all Issues BCF.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/:rid/issues.bcfzip",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "description": "<p>Get Issues BCF export based on revision ID.</p>",
    "version": "0.0.0",
    "filename": "routes/issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "post",
    "url": "/:teamspace/:model/revision/:rid/issues.bcfzip",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "description": "<p>Upload Issues BCF file using current revision ID.</p>",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "Status",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response.",
          "content": "HTTP\n{\n\t\"status\":\"ok\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/issues/:uid/viewpoints/:vid/screenshotSmall.png",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "Issue",
            "description": "<p>Screenshot.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "post",
    "url": "/:teamspace/:model/issues.bcfzip",
    "title": "Import BCF file",
    "name": "importBCF",
    "group": "Issues",
    "description": "<p>Upload an Issues BCF file.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/issues.json",
    "title": "Get all Issues",
    "name": "listIssues",
    "group": "Issues",
    "description": "<p>List all available issue for current model.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
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
            "field": "Issue",
            "description": "<p>Object.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response.",
          "content": "HTTP/1.1 200 OK\n[\n\t{\n\t\t\"_id\":\"ISSUE_ID\",\n\t\t\"creator_role\":\"Client\",\"scale\":1,\n\t\t\"due_date\":1543881600000,\n\t\t\"priority\":\"low\",\n\t\t\"desc\":\"reverse\",\n\t\t\"topic_type\":\"for_information\",\n\t\t\"status\":\"for approval\",\n\t\t\"owner\":\"username\",\n\t\t\"created\":1546217360002,\n\t\t\"name\":\"Without reverse\",\n\t\t\"number\":2,\n\t\t\"rev_id\":\"REVISION_ID\",\n\t\t\"__v\":0,\n\t\t\"assigned_roles\":[\"Architect\"],\n\t\t\"viewCount\":1,\n\t\t\"commentCount\":0,\n\t\t\"thumbnail\":\"nabile/MODEL_ID/issues/ISSUE_ID/thumbnail.png\",\n\t\t\"norm\":[0,0,0],\n\t\t\"position\":[8341.8056640625,1279.962158203125,-3050.34521484375],\n\t\t\"typePrefix\":\"sample\",\n\t\t\"modelCode\":\"\",\n\t\t\"account\":\"username\",\n\t\t\"model\":\"MODEL_ID\",\n\t\t\"viewpoint\":\n\t\t\t{\n\t\t\t\t\"near\":54.739341735839844,\n\t\t\t\t\"far\":27369.669921875,\n\t\t\t\t\"fov\":1.0471975803375244,\n\t\t\t\t\"aspect_ratio\":1.451704502105713,\n\t\t\t\t\"hideIfc\":true,\n\t\t\t\t\"guid\":\"9279d95e-3aee-49c2-ba45-9d2302044597\",\n\t\t\t\t\"_id\":\"5c296790e5f57704580ca00a\",\n\t\t\t\t\"type\":\"perspective\",\n\t\t\t\t\"screenshot\":\"ACCOUNT/MODEL_ID/issues/ISSUE_ID/viewpoints/MODEL_ID/screenshot.png\",\n\t\t\t\t\"clippingPlanes\":[],\"right\":[0.7270411252975464,1.862645149230957e-8,0.6865938901901245],\n\t\t\t\t\"view_dir\":[0.6777805089950562,-0.15971262753009796,-0.7177084684371948],\n\t\t\t\t\"look_at\":[8400.001953125,2339.99951171875,-9599.9990234375],\n\t\t\t\t\"position\":[-3360.6259765625,5111.28125,2853.4453125],\n\t\t\t\t\"up\":[0.10965770483016968,0.9871635437011719,-0.11611767113208771],\n\t\t\t\t\"screenshotSmall\":\"nabile/MODEL_ID/issues/ISSUE_ID/viewpoints/MODEL_ID/screenshotSmall.png\"\n\t\t\t}\n\t}\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/:rid/issues.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "description": "<p>Get all issues related to specific revision ID.</p>",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "Issues",
            "description": "<p>Object</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": "\n[\n\t{\n\t\t\"_id\":\"issue_ID\",\n\t\t\"creator_role\":\"Client\",\n\t\t\"scale\":1,\n\t\t\"due_date\":1547424000000,\n\t\t\"priority\":\"low\",\n\t\t\"desc\":\"This is a description\",\n\t\t\"topic_type\":\"for_information\",\n\t\t\"status\":\"open\",\"owner\":\"username\",\n\t\t\"created\":1546626949432,\n\t\t\"name\":\"An Issue for API\",\n\t\t\"number\":3,\n\t\t\"rev_id\":\"9cf31c6e-37cc-4625-8cee-270cf731059e\",\n\t\t\"__v\":0,\n\t\t\"assigned_roles\":[\"Architect\"],\n\t\t\"viewCount\":1,\"commentCount\":0,\n\t\t\"thumbnail\":\"ACCOUNT/MODEL_ID/issues/ISSUE_ID/thumbnail.png\",\n\t\t\"norm\":[],\"position\":[],\n\t\t\"typePrefix\":\"sample\",\n\t\t\"modelCode\":\"\",\n\t\t\"account\":\"username\",\n\t\t\"model\":\"MODEL_ID\",\n\t\t\"viewpoint\":\n\t\t\t{\n\t\t\t\t\"near\":54.739341735839844,\n\t\t\t\t\"far\":27369.669921875,\n\t\t\t\t\"fov\":1.0471975803375244,\n\t\t\t\t\"aspect_ratio\":2.522167444229126,\n\t\t\t\t\"hideIfc\":true,\n\t\t\t\t\"guid\":\"5afbe23f-8307-42d0-ba77-f031922281ce\",\n\t\t\t\t\"_id\":\"5c2fa785b4af3c45f8f83c60\",\n\t\t\t\t\"type\":\"perspective\",\n\t\t\t\t\"screenshot\":\"username/MODEL_ID/issues/ISSUE_ID/viewpoints/5afbe23f-8307-42d0-ba77-f031922281ce/screenshot.png\",\n\t\t\t\t\"clippingPlanes\":[],\"right\":[0.7270411252975464,1.862645149230957e-8,0.6865938901901245],\n\t\t\t\t\t\"view_dir\":[0.6777805089950562,-0.15971262753009796,-0.7177084684371948],\n\t\t\t\t\t\"look_at\":[8400.001953125,2339.99951171875,-9599.9990234375],\n\t\t\t\t\t\"position\":[-3360.6259765625,5111.28125,2853.4453125],\n\t\t\t\t\t\"up\":[0.10965770483016968,0.9871635437011719,-0.11611767113208771],\n\t\t\t\t\t\"screenshotSmall\"username/MODEL_ID/issues/ISSUE_ID/viewpoints/5afbe23f-8307-42d0-ba77-f031922281ce/screenshot.png\"}\n\t}\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/issues.html",
    "title": "Issues response into as HTML",
    "name": "renderIssuesHTML",
    "group": "Issues",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          }
        ]
      }
    },
    "description": "<p>Render all Issues into a HTML webpage, response is rendered HTML.</p>",
    "version": "0.0.0",
    "filename": "routes/issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/:rid/issues.html",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "description": "<p>Render all Issues into a HTML webpage based on current revision ID.</p>",
    "version": "0.0.0",
    "filename": "routes/issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "post",
    "url": "/:teamspace/:model/issues.json",
    "title": "Create a new issue.",
    "name": "storeIssue",
    "group": "Issues",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          }
        ]
      }
    },
    "description": "<p>Create a new issue. This is the same endpoint as listIssues, but a post request is required.</p>",
    "version": "0.0.0",
    "filename": "routes/issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "post",
    "url": "/:teamspace/:model/issuesId.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "filename": "routes/issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "put",
    "url": "/:teamspace/:model/revision/\"rid/issues/:issueId.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "filename": "routes/issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "put",
    "url": "/:teamspace/:model/issues.json/issueId.json",
    "title": "Update an Issue.",
    "name": "updateIssue",
    "group": "Issues",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Issue unique ID.</p>"
          }
        ]
      }
    },
    "description": "<p>Update an issue with an existing Issue ID</p>",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "Updated",
            "description": "<p>Issue Object.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/issue.js",
    "groupTitle": "Issues"
  },
  {
    "type": "post",
    "url": "/:teamspace/jobs/:jobId/:user",
    "title": "Assign a job to a user",
    "name": "addUserToJob",
    "group": "Jobs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/job.js",
    "groupTitle": "Jobs"
  },
  {
    "type": "post",
    "url": "/:teamspace/jobs",
    "title": "Create a new job",
    "name": "createJob",
    "group": "Jobs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/job.js",
    "groupTitle": "Jobs"
  },
  {
    "type": "delete",
    "url": "/:teamspace/jobs/:jobId",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/job.js",
    "groupTitle": "Jobs"
  },
  {
    "type": "get",
    "url": "/:teamspace/myJob",
    "title": "Get user Job",
    "name": "getUserJob",
    "group": "Jobs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/job.js",
    "groupTitle": "Jobs"
  },
  {
    "type": "get",
    "url": "/:teamspace/jobs/colors",
    "title": "List all Colors",
    "name": "listColors",
    "group": "Jobs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/job.js",
    "groupTitle": "Jobs"
  },
  {
    "type": "get",
    "url": "/:teamspace/jobs",
    "title": "List all Jobs",
    "name": "listJobs",
    "group": "Jobs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/job.js",
    "groupTitle": "Jobs"
  },
  {
    "type": "delete",
    "url": "/:teamspace/jobs",
    "title": "Remove a job from a user",
    "name": "removeUserFromJobs",
    "group": "Jobs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/job.js",
    "groupTitle": "Jobs"
  },
  {
    "type": "put",
    "url": "/:teamspace/jobs/:jobId",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/job.js",
    "groupTitle": "Jobs"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/master/head/meta/4DTaskSequence.json",
    "title": "Get All information for 4D Sequence Tags",
    "name": "getAllIdsWith4DSequenceTag",
    "group": "Meta",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/meta.js",
    "groupTitle": "Meta"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/:rev/meta/4DTaskSequence.json",
    "title": "Get All information for 4D Sequence Tags by revision",
    "name": "getAllIdsWith4DSequenceTag",
    "group": "Meta",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "filename": "routes/meta.js",
    "groupTitle": "Meta"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/:rev/meta/findObjsWith/:metaKey.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
            "description": "<p>metadata field to search for</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/meta.js",
    "groupTitle": "Meta"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/master/head/meta/findObjsWith/:metaKey.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
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
    "filename": "routes/meta.js",
    "groupTitle": "Meta"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/:rev/meta/findObjsWith/:metaKey.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "filename": "routes/meta.js",
    "groupTitle": "Meta"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/master/head/meta/all.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/meta.js",
    "groupTitle": "Meta"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/:rev/meta/all.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "filename": "routes/meta.js",
    "groupTitle": "Meta"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/meta/:id.json",
    "title": "Get meta data",
    "name": "getMetadata",
    "group": "Meta",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "filename": "routes/meta.js",
    "groupTitle": "Meta"
  },
  {
    "type": "post",
    "url": "/:teamspace/:model",
    "title": "Create a model",
    "name": "createModel",
    "group": "Model",
    "version": "0.0.0",
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "delete",
    "url": "/:teamspace/:model",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/settings/heliSpeed",
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/master/head/idMap.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/:rev/idMap.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/:rev/idToMeshes.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/master/head/idToMeshes.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/:uid.json.mpc",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
            "description": "<p>name of the json.mpc file</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/master/head/modelProperties.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/:rev/modelProperties.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model.json",
    "title": "Get Model Setting",
    "name": "getModelSetting",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/:rev/fulltree.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/master/head/fulltree.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/model/permissions",
    "title": "Get Multiple Model Permissions",
    "name": "getMultipleModelsPermissions",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/permissions",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/:rev/tree_path.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/master/head/tree_path.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/:rev/unityAssets.json",
    "title": "Get Unity Assets List based on revision and model",
    "name": "getUnityAssets",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/master/head/unityAssets.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/:uid.unity3d",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
            "field": "uid",
            "description": "<p>name of the unity bundle</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/:rev/searchtree.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revision/master/head/searchtree.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "put",
    "url": "/:teamspace/:model/settings/heliSpeed",
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "put",
    "url": "/:teamspace/:model",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Federated Model ID to update</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "post",
    "url": "/:teamspace/models/permissions",
    "title": "Update Multiple Model Permissions",
    "name": "updateMultiplePermissions",
    "group": "Model",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "post",
    "url": "/:teamspace/:model/permissions",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "put",
    "url": "/:teamspace/:model/settings/",
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "post",
    "url": "/:teamspace/:model/revision/master/head/searchtree.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/download/latest",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/model.js",
    "groupTitle": "Model"
  },
  {
    "type": "delete",
    "url": "/notifications",
    "title": "Delete All notification",
    "name": "deleteAllNotifications",
    "group": "Notification",
    "version": "0.0.0",
    "filename": "routes/notification.js",
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
    "filename": "routes/notification.js",
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
    "filename": "routes/notification.js",
    "groupTitle": "Notification"
  },
  {
    "type": "get",
    "url": "/notifications",
    "title": "Get all notifications",
    "name": "getNotifications",
    "group": "Notification",
    "version": "0.0.0",
    "filename": "routes/notification.js",
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
    "filename": "routes/notification.js",
    "groupTitle": "Notification"
  },
  {
    "type": "post",
    "url": "/:teamspace/permission-templates",
    "title": "Create a Permission Template",
    "name": "createTemplate",
    "group": "Permission_Template",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/permissionTemplate.js",
    "groupTitle": "Permission_Template"
  },
  {
    "type": "delete",
    "url": "/:teamspace/permission-templates/:permissionId",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/permissionTemplate.js",
    "groupTitle": "Permission_Template"
  },
  {
    "type": "get",
    "url": "/:teamspace/permission-templates",
    "title": "List all Permission Templates",
    "name": "listTemplates",
    "group": "Permission_Template",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/permissionTemplate.js",
    "groupTitle": "Permission_Template"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/permission-templates",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID to get permission templates for.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/permissionTemplate.js",
    "groupTitle": "Permission_Template"
  },
  {
    "type": "get",
    "url": "/plans",
    "title": "List all Plans",
    "name": "listPlans",
    "group": "Plan",
    "version": "0.0.0",
    "filename": "routes/plan.js",
    "groupTitle": "Plan"
  },
  {
    "type": "post",
    "url": "/:teamspace/projects",
    "title": "Create a project",
    "name": "createProject",
    "group": "Project",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of the teamspace</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/project.js",
    "groupTitle": "Project"
  },
  {
    "type": "delete",
    "url": "/:teamspace/projects/:project",
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
            "field": "teamspace",
            "description": "<p>Name of the teamspace</p>"
          },
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
    "filename": "routes/project.js",
    "groupTitle": "Project"
  },
  {
    "type": "get",
    "url": "/:teamspace/projects/:project",
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
            "field": "teamspace",
            "description": "<p>Name of the teamspace</p>"
          },
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
    "filename": "routes/project.js",
    "groupTitle": "Project"
  },
  {
    "type": "get",
    "url": "/:teamspace/projects",
    "title": "List all projects",
    "name": "listProjects",
    "group": "Project",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of the teamspace</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/project.js",
    "groupTitle": "Project"
  },
  {
    "type": "put",
    "url": "/:teamspace/projects/:project",
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
            "field": "teamspace",
            "description": "<p>Name of the teamspace</p>"
          },
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
    "filename": "routes/project.js",
    "groupTitle": "Project"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revisions.json",
    "title": "List all revisions",
    "name": "listRevisions",
    "group": "Revisions",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          }
        ]
      }
    },
    "description": "<p>List all revisions for current model.</p>",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "Revisions",
            "description": "<p>Object</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": "HTTP/1.1 200 OK\n[\n\t{\n\t\t\"_id\":\"24226282-429a-49a0-8e38-96bc2ff28ef1\",\n\t\t\"author\":\"username\",\n\t\t\"tag\":\"sample\",\n\t\t\"timestamp\":\"2018-12-27T11:02:15.000Z\",\n\t\t\"name\":\"24226282-429a-49a0-8e38-96bc2ff28ef1\",\n\t\t\"branch\":\"master\"\n\t}\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/history.js",
    "groupTitle": "Revisions"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/revisions/:branch.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "description": "<p>List all revisions using the current branch.</p>",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Revisions",
            "description": "<p>Object based on branch.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response",
          "content": "HTTP/1.1 200 OK\n[\n\t {\n\t\t \"_id\": \"revision_ID\",\n\t\t \"author\": \"username\",\n\t\t \"desc\": \"For coordination\",\n\t\t \"tag\": \"r3\",\n\t\t \"timestamp\": \"2018-01-16T16:02:54.000Z\",\n\t\t \"name\": \"revision_ID\",\n\t\t \"branch\": \"master\"\n\t },\n\t {\n\t\t \"_id\": \"revision_ID\",\n\t\t \"author\": \"username\",\n\t\t \"desc\": \"Roof access added\",\n\t\t \"tag\": \"r2\",\n\t\t \"timestamp\": \"2018-01-16T15:26:58.000Z\",\n\t\t \"name\": \"revision_ID\",\n\t\t \"branch\": \"master\"\n\t },\n\t {\n\t\t \"_id\": \"revision_ID\",\n\t\t \"author\": \"username\",\n\t\t \"desc\": \"Initial design\",\n\t\t \"tag\": \"r1\",\n\t\t \"timestamp\": \"2018-01-16T15:19:01.000Z\",\n\t\t \"name\": \"revision_ID\",\n\t\t \"branch\": \"master\"\n\t }\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/history.js",
    "groupTitle": "Revisions"
  },
  {
    "type": "put",
    "url": "/:teamspace/:model/revisions/:id/tag",
    "title": "Update Revision Tag",
    "name": "updateRevisionTag",
    "group": "Revisions",
    "description": "<p>Update revision tag</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "filename": "routes/history.js",
    "groupTitle": "Revisions"
  },
  {
    "type": "delete",
    "url": "/:teamspace/:model/risks/",
    "title": "Delete risks",
    "name": "deleteRisks",
    "group": "Risks",
    "version": "0.0.0",
    "filename": "routes/risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/risks/:uid.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Risk ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/risks/:uid/screenshot.png",
    "title": "Get Risks Screenshot",
    "name": "getScreenshot",
    "group": "Risks",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/risks/:uid/screenshotSmall.png",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Risk ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/risks/:uid/thumbnail.png",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Risk ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/risks.json",
    "title": "List All Risks",
    "name": "listRisks",
    "group": "Risks",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/risks/:rid/risks.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Revision ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/risks.html",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "rid",
            "description": "<p>Revision ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/risks.html",
    "title": "Render all Risks as HTML",
    "name": "renderRisksHTML",
    "group": "Risks",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "post",
    "url": "/:teamspace/:model/risks.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Revision ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "post",
    "url": "/:teamspace/:model/revision/:rid/risks.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "rid",
            "description": "<p>Revision ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "put",
    "url": "/:teamspace/:model/risks/riskId.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "riskId.json",
            "description": "<p>Risk ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "put",
    "url": "/:teamspace/:model/revision/:rid/risks/:riskId.json",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "rid",
            "description": "<p>Revision ID.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "riskId",
            "description": "<p>Risk ID.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/risk.js",
    "groupTitle": "Risks"
  },
  {
    "type": "get",
    "url": "/:teamspace/subscriptions",
    "title": "List all subscriptions",
    "name": "listSubscriptions",
    "group": "Subscription",
    "description": "<p>List all subscriptions for current user if applicable.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "401": [
          {
            "group": "401",
            "optional": false,
            "field": "NOT_AUTHORIZED",
            "description": "<p>Not Authorized</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response",
          "content": "HTTP/1.1 401 Not Authorized\n{\n\t\"message\":\"Not Authorized\",\n\t\"status\":401,\"code\":\n\t\"NOT_AUTHORIZED\",\n\t\"value\":9,\n\t\"place\":\"GET /nabile/subscriptions\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/subscriptions.js",
    "groupTitle": "Subscription"
  },
  {
    "type": "get",
    "url": "/:teamspace/subscriptions",
    "title": "Update a subscription",
    "name": "updateSubscription",
    "group": "Subscription",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/subscriptions.js",
    "groupTitle": "Subscription"
  },
  {
    "type": "post",
    "url": "/:teamspace/members",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/teamspace.js",
    "groupTitle": "Teamspace"
  },
  {
    "type": "get",
    "url": "/:teamspace/members/search/:searchString",
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
    "filename": "routes/teamspace.js",
    "groupTitle": "Teamspace"
  },
  {
    "type": "get",
    "url": "/:teamspace/members",
    "title": "Get Member List",
    "name": "getMemberList",
    "group": "Teamspace",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/teamspace.js",
    "groupTitle": "Teamspace"
  },
  {
    "type": "get",
    "url": "/:teamspace/members",
    "title": "Get Member List",
    "name": "getMemberList",
    "group": "Teamspace",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/teamspace.js",
    "groupTitle": "Teamspace"
  },
  {
    "type": "get",
    "url": "/:teamspace/quota",
    "title": "Get Quota Information",
    "name": "getQuotaInfo",
    "group": "Teamspace",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/teamspace.js",
    "groupTitle": "Teamspace"
  },
  {
    "type": "delete",
    "url": "/:teamspace/members/:user",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
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
    "filename": "routes/teamspace.js",
    "groupTitle": "Teamspace"
  },
  {
    "type": "delete",
    "url": "/apikey",
    "title": "Deletes the current apikey for the logged user",
    "name": "deleteApiKey",
    "group": "User",
    "version": "0.0.0",
    "filename": "routes/user.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/apikey",
    "title": "Generates an apikey for the logged user",
    "name": "generateApiKey",
    "group": "User",
    "version": "0.0.0",
    "filename": "routes/user.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/me",
    "title": "Gets the profile for the logged user",
    "name": "getProfile",
    "group": "User",
    "version": "0.0.0",
    "filename": "routes/user.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/:teamspace/:model/viewpoints/",
    "title": "Create a Viewpoint",
    "name": "createViewpoint",
    "group": "Viewpoint",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/viewpoint.js",
    "groupTitle": "Viewpoint"
  },
  {
    "type": "delete",
    "url": "/:teamspace/:model/viewpoints/:uid",
    "title": "Delete a Viewpoint",
    "name": "deleteViewpoint",
    "group": "Viewpoint",
    "version": "0.0.0",
    "filename": "routes/viewpoint.js",
    "groupTitle": "Viewpoint"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/viewpoints/:uid",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "filename": "routes/viewpoint.js",
    "groupTitle": "Viewpoint"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/viewpoints/:uid",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "filename": "routes/viewpoint.js",
    "groupTitle": "Viewpoint"
  },
  {
    "type": "get",
    "url": "/:teamspace/:model/viewpoints",
    "title": "List all Viewpoints",
    "name": "listViewpoints",
    "group": "Viewpoint",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/viewpoint.js",
    "groupTitle": "Viewpoint"
  },
  {
    "type": "put",
    "url": "/:teamspace/:model/viewpoints/:uid",
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
            "field": "teamspace",
            "description": "<p>Name of teamspace</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "model",
            "description": "<p>Model ID</p>"
          },
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
    "filename": "routes/viewpoint.js",
    "groupTitle": "Viewpoint"
  }
] });
