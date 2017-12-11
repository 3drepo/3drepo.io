

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

}())