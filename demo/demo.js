var PREFIX = "https://www.3drepo.io";
var API_PREFIX = "https://api1.www.3drepo.io";

init();

function init() {

    // Replace as appropriate
    var API = API_PREFIX + "/api/";
    var account;

    // Set the API for the viewer (for fetching models etc)
    setAPI();

    function setAPI() {
        UnityUtil.setAPIHost({
            hostNames: [API]
		});

		var apiKey = prompt("Please enter your API key.");
		if(apiKey) {
			UnityUtil.setAPIKey(apiKey);
    		initialiseViewer()
		}
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
        var teamspace = document.getElementById("teamspace").value;
        var project = document.getElementById("project").value;
        var model = document.getElementById("model").value;
		changeStatus("Loading Model...", teamspace, project, model);
        document.getElementById("modelSubmit").disabled = true;
        if (teamspace && project && model) {
            UnityUtil.loadModel(teamspace, project, model)
            .then(function(){
                console.log("Model loaded")
                document.getElementById("modelSubmit").disabled = false;
                changeStatus("");
            });
        } else {
            console.error("Teamspace, project, or model not valid: ", teamspace, project, model);
        }

    }

    function prepareViewer() {

        var unityLoaderPath = PREFIX + "/unity/Build/unity.loader.js";

        var unityLoaderScript = document.createElement("script");
        return new Promise(function(resolve, reject) {

            unityLoaderScript.async = true;
            unityLoaderScript.addEventListener ("load", function() {
                console.debug("Loaded unity.loader.js succesfully");
                resolve();
            }, false);

            unityLoaderScript.addEventListener ("error", function(error) {
                console.error("Error loading unity.loader.js", error);
                reject("Error loading unity.loader.js");
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

            UnityUtil.init(function(error) {
                console.error(error);
            });
			UnityUtil.loadUnity(document.getElementById("unity"), PREFIX);

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
