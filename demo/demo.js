
var PREFIX = "https://www.3drepo.io";
var API_PREFIX = "https://api1.www.3drepo.io";

// Unity requires its setting in a global 
// variable called Module
var Module = {
    TOTAL_MEMORY: 2130706432,
};

init();

function init() {

    // Replace as appropriate 
    var API = API_PREFIX + "/api/";
    var account;

    // Set the API for the viewer (for fetching models etc)
    setAPI();

    // Login using JavaScript prompts and fetch
    login();

    function login() {


        // Get user credentials
        var username = prompt("Please enter your 3drepo.io username");
        var password = prompt("Please enter your 3drepo.io password");
        var credentials = {username: username, password: password};
        account = username;
        
        var post = { 
            method: 'POST',
            headers: {
                'Access-Control-Allow-Origin': "*",
                'Access-Control-Allow-Credentials': 'true',
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            credentials: 'include', // include, same-origin, *omit
            mode: "cors",
            body: JSON.stringify(credentials)
        };

        var LOGIN_URL = API + "login";

        // Use the Fetch API
        fetch(LOGIN_URL, post)
            .then(function(response) {

                var validResponse = response.status !== 200;

                response.json()
                    .then(function(json){
                        if (validResponse) {
                           
                            if (json.code === "ALREADY_LOGGED_IN") {
                                console.log("Already logged in!")
                                initialiseViewer()
                            } else {
                                confirm(json.message)
                            }
                            
                        } else {
                            // If we log in succesfully than initialise the viewer
                            initialiseViewer()
                        }
                    })
                    .catch(function(error){
                        confirm("Error getting JSON: ", error)
                    })
            
            })
            .catch(function(error) {
                if (error.code === "ALREADY_LOGGED_IN") {
                    initialiseViewer()
                } else {
                    confirm("Error logging in: ", error)
                }
            })

    }

    function setAPI() {
        UnityUtil.setAPIHost({
            hostNames: [API]
        });
    }

    function initialiseViewer() {

        console.log("Initialising 3D Repo Viewer...");
        changeStatus("Loading Viewer...")
        prepareViewer().then(function(){
            initUnity().then(function(){
                document.getElementById("modelSubmit").onclick = handleModelInput
            })
        })

    }

    function changeStatus(text) {
        document.getElementById("status").innerText = text
    }

    function handleModelInput() {

        var model = document.getElementById("model").value;
        changeStatus("Loading Model...", account, model);
        document.getElementById("modelSubmit").disabled = true;
        if (account && model) {
            UnityUtil.loadModel(account, model)
            .then(function(){
                console.log("Model loaded")
                document.getElementById("modelSubmit").disabled = false;
                changeStatus("");
            });
        } else {
            console.error("Model or account not valid: ", account, model);
        }
        
    }

    function prepareViewer() {

        var unityLoaderPath = PREFIX + "/unity/Build/UnityLoader.js";

        var unityLoaderScript = document.createElement("script");
        return new Promise(function(resolve, reject) {

            unityLoaderScript.async = true;
            unityLoaderScript.addEventListener ("load", function() {
                console.debug("Loaded UnityLoader.js succesfully");
                resolve();
            }, false);

            unityLoaderScript.addEventListener ("error", function(error) {
                console.error("Error loading UnityLoader.js", error);
                reject("Error loading UnityLoader.js");
            }, false);

            // Event handlers MUST come first before setting src
            unityLoaderScript.src = unityLoaderPath;

            // This kicks off the actual loading of Unity
            viewer.appendChild(unityLoaderScript);
        });
        
    };

    function initUnity() {
        return new Promise(function(resolve, reject) {
            
            document.body.style.cursor = "wait";

            Module.errorhandler = UnityUtil.onError;

            UnityUtil.init(function(error) {
                console.error(error);
            });
            UnityUtil.loadUnity("unity", PREFIX + "/unity/Build/unity.json");
            
            UnityUtil.onReady().then(function() {
                changeStatus("")
                resolve();
            }).catch(function(error){
                console.error("UnityUtil.onReady failed: ", error);
                reject(error);
            });
            
        });
    }

}
