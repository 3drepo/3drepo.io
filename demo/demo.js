
var PREFIX = "https://www.3drepo.io";

// Unity requires its setting in a global 
// variable called Module
var Module = {
    TOTAL_MEMORY: 2130706432,
    errorhandler: null,			// arguments: err, url, line. This function must return 'true' if the error is handled, otherwise 'false'
    compatibilitycheck: null,
    backgroundColor: "#222C36",
    splashStyle: "Light",
    dataUrl: PREFIX + "/unity/Release/unity.data",
    codeUrl: PREFIX + "/unity/Release/unity.js",
    asmUrl: PREFIX + "/unity/Release/unity.asm.js",
    memUrl: PREFIX + "/unity/Release/unity.mem",
};

init();

function init() {

    // Replace as appropriate 
    var API = PREFIX + "/api/";
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
            mode: "cors",
            body: JSON.stringify(credentials)
        };

        var LOGIN_URL = API + "login";

        console.log(LOGIN_URL);
        
        // Use the Fetch API
        fetch(LOGIN_URL, post)
            .then(function(response) {

                var validResponse = response.status !== 200;

                response.json()
                    .then(function(json){
                        if (validResponse) {
                            confirm(json.message)
                        } else {
                            // If we log in succesfully than initialise the viewer
                            initialiseViewer(json)
                        }
                    })
                    .catch(function(error){
                        confirm("Error getting JSON: ", error)
                    })
            
            })
            .catch(function(error) {
                confirm("Error logging in: ", error)
            })

    }

    function setAPI() {
        UnityUtil.setAPIHost({
            hostNames: [API]
        });
    }

    function initialiseViewer(json) {

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

        var unityLoaderPath = PREFIX + "/unity/Release/UnityLoader.js";
        var viewer = document.createElement("div");
        viewer.className = "viewer";

        var canvas = document.createElement("canvas");
        canvas.className = "emscripten";
        canvas.setAttribute("id", "canvas");
        canvas.setAttribute("tabindex", "1"); // You need this for canvas to register keyboard events
        canvas.setAttribute("oncontextmenu", "event.preventDefault()");

        canvas.onmousedown = function(){
            return false;
        };

        canvas.style["pointer-events"] = "all";
        
        document.body.appendChild(viewer);
        viewer.appendChild(canvas);

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
