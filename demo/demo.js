

var Module = {
    TOTAL_MEMORY: 2130706432,
    errorhandler: null,			// arguments: err, url, line. This function must return 'true' if the error is handled, otherwise 'false'
    compatibilitycheck: null,
    backgroundColor: "#222C36",
    splashStyle: "Light",
    dataUrl: "./../frontend/unity/Release/unity.data",
    codeUrl: "./../frontend/unity/Release/unity.js",
    asmUrl: "./../frontend/unity/Release/unity.asm.js",
    memUrl: "./../frontend/unity/Release/unity.mem",
};


(function(){

    login();

    function login() {

        // Replace as appropriate 
        var LOGIN_URL = "https://api1.www.3drepo.io/api/login";
        
        // Get user credentials
        var username = prompt("Please enter your 3drepo.io username");
        var password = prompt("Please enter your 3drepo.io password");
        var credentials = {username: username, password: password};
        
        var post = { 
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials),
            mode: 'cors'
        };


        // Use the Fetch API
        fetch(LOGIN_URL, post)
            .then(function(response) {

                var validResponse = response.status !== 200;

                response.json().then(function(json){
                    if (validResponse) {
                        confirm(json.message)
                        location.reload()
                    } else {
                        initialiseViewer(json)
                    }
                })
            
            })
            .catch(function(error) {
                confirm("Error", error)
            })

    }
   
    function initialiseViewer(json) {

        console.log("Initialising 3D Repo Viewer...");
        viewer = new Viewer("3DRepo", document.body, viewerCallback, viewerErrorCallback);
        viewer.unityLoaderPath = "./../frontend/unity/Release/UnityLoader.js";
        viewer.prepareViewer();
        viewer.insertUnityLoader();
    
    
        var options = {
            showAll : true,
            getAPI: {
                hostNames:  [location.href] // Must be an array
            }
        };
    
        viewer.init(options);
    
        function viewerCallback() {}
        function viewerErrorCallback() {}

    }
   

}())