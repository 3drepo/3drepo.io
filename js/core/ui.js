//gui creation and update behaviour

//----------------------------------------------------------------------------------------------------------------------
//enter frame / exit frame

var onEnterFrame = function()
{
    popGeoData.renderedTriangles.max = x3dom.nodeTypes.PopGeometry.numTotalTris;
    //defined in scene
    if(typeof numInstances != "undefined")
    {
        popGeoData.renderedTriangles.max = popGeoData.renderedTriangles.max * (numInstances * numInstances);
    }

    //setup error bound
    x3dom.nodeTypes.PopGeometry.ErrorToleranceFactor = popGeoData.errorBound;
};


var onExitFrame = function()
{
    //update the current value of the progressbar, computed during rendering
    var popGeos = document.getElementsByTagName("popGeometry");
    popGeoData.minPrecBits = 16;
    popGeoData.maxPrecBits = 0;

    popGeoData.renderedSubMeshes.max = popGeos.length;
    var numRenderedSubs = popGeos.length;
    for (var i = 0; i < popGeos.length; ++i)
    {
        var lod = popGeos[i]._x3domNode._mesh.currentLOD;
        popGeoData.minPrecBits = lod < popGeoData.minPrecBits ? lod : popGeoData.minPrecBits;
        popGeoData.maxPrecBits = lod > popGeoData.maxPrecBits ? lod : popGeoData.maxPrecBits;
    }

    //popGeoData.precisionBitsString = popGeoData.getPrecBitsString();
    popGeoData.renderedTriangles.value = x3dom.nodeTypes.PopGeometry.numRenderedTris;
    //popGeoData.renderedSubMeshes.value = numRenderedSubs;

    $(".triangles").each(function() {
        $(this).progressbar({
            value : popGeoData.renderedTriangles.getPercentage()
        }).children("span").html("▲  " +popGeoData.renderedTriangles.getCurrentValueString()).appendTo(this);
    });

   //$("#renderedSubMeshesPB").each(function() {
   //    $(this).progressbar({
   //        value : popGeoData.renderedSubMeshes.getPercentage()
   //    }).children("span").html(popGeoData.renderedSubMeshes.getCurrentValueString()).appendTo(this);
   //});
   ////$("#pBValueField").html(popGeoData.getPrecBitsString());
   //$("#precisionRangeSlider").slider("option","values", [popGeoData.minPrecBits, popGeoData.maxPrecBits] );
   //$("#precisionRange > .settingName").html("Precision Range (Bits): "+popGeoData.getPrecBitsString());


    //$("#rtTitle").html("Triangles: "+popGeoData.renderedTriangles.value );

    var currentFPS = this.getFPS().toFixed(2);
    document.getElementById("FPS").innerHTML     = "FPS "  + currentFPS;
//    document.getElementById("headFPS").innerHTML = "FPS: " + currentFPS;

    this.canvas.doc.needRender = true;
}

//----------------------------------------------------------------------------------------------------------------------
// video toggles
function updateVisibility()
{
     //if(headerSettings == null)
     //{
     //    return;
     //}
     //$("#headLine")[0].style.visibility = (headerSettings.showTitle) ? "visible" : "hidden";
     //$("#headFPS")[0].style.visibility = (headerSettings.showFPS) ? "visible" : "hidden";
     //$("#headErrorBound")[0].style.visibility = (headerSettings.showErrorBound) ? "visible" : "hidden";
     //$("#headTrianglePB")[0].style.visibility = (headerSettings.showTriangles) ? "visible" : "hidden";
}

//----------------------------------------------------------------------------------------------------------------------
//create ui

createGui = function()
{
    //create accordion
    $(".section").accordion({
        collapsible: true,
        heightStyle: "content",
        active: 0
    });

    //statistics

    //rendered triangles progressbar
    $("#renderedTrianglesPB").progressbar({
        value: 75
        });

    //$("#bigTrianglePB").progressbar({
    //    value: 75
    //    });


    //precision range slider
    //$("#precisionRangeSlider").slider({
    //    range: true,
    //    min: 0,
    //    max: 16,
    //    values: [ 17, 67 ],
    //    disabled: true,
    //    slide: function( event, ui )
    //    {
    //    }
    //});
    //$("#precisionRangeSlider > a").each(function(){
    //    $(this).addClass("precSlider");
    //    $(this).html("▲");
    //    });
    //

    //rendered submehes progressbar
 //$("#renderedSubMeshesPB").progressbar({
 //    value: 75
 //    });
 //#

    $(".progress ").each(function(){
      $(this).addClass("progressBarCorners");
    });
 
    $(".progress > .ui-progressbar-value").each(function(){
      $(this).addClass("progressBarColorGradient")
    });
 
    //interaction

    var headErrorBound = $("#headErrorBound");

    //error bound
    var updateErrorBound = function(value)
    {
        popGeoData.errorBound = value;
        //headErrorBound.html("Error Bound: " + popGeoData.errorBound);
    };

    var updateEBFromEvent = function(event, ui)
    {
        if(ui !== undefined)
        {
            updateErrorBound(ui.value);
            if ($("#ebTitle")[0])
                $("#ebTitle")[0].innerText = 'Error Bound (Pixels): ' + ui.value;
        }
    };
    
    $("#errorBoundSlider").slider({
        step: 1,
        min: 0,
        max: 12,
        value: 1,
        slide : updateEBFromEvent
    });
    
    //var spinner = $("#errorBoundSpinner").spinner({
    //    step: 0.5,
    //    numberFormat: "n",
    //    min: 0,
    //    max: 40
    //    });

    //spinner.bind("spin",updateEBFromEvent);
    //spinner.bind("change",updateEBFromEvent);
    //spinner.keypress(function(e)
    //{
    //    if (e.keyCode == $.ui.keyCode.ENTER)
    //    {
    //        updateErrorBound(spinner.spinner( "value" ));
    //    }
    //});

    //max pop level
    //$("#maxPopSlider").slider({
    //    step: 1,
    //    min: 1,
    //    max: 16,
    //    value: 12,
    //    slide: function( event, ui )
    //    {
    //    console.log("maxpop = "+this.value);// $(this).slider("option","value"));
    //    }
    //});

    //$("#maxPopSlider > a").each(function(){
    //    $(this).addClass("maxPopSlider");
    //    });

    //statistics
    //$("#dspStatus").click(function( event ) {
    //    document.getElementById('x3dElement').runtime.statistics(this.checked);
    //    });
    //
    ////console
    //$("#dspConsole").click(function( event ) {
    //    var x3dElement = document.getElementById('x3dElement');
    //    x3dElement.style.height = 'auto%';
    //    x3dElement.runtime.debug();
    //    });

     $("#interactionFactorSlider").slider({
        step: 1,
        min: 1,
        max: 4,
        value: 1,
        slide : function(event, ui)
        {
            x3dom.nodeTypes.PopGeometry.PrecisionFactorOnMove = ui.value;
            if ($("#ifTitle")[0])
                $("#ifTitle")[0].innerText = 'Interaction Factor: ' + ui.value;
        }
    });
    
    // render mode
    $("#renderMode").buttonset();
    $("#renderMode").change(function() {
            x3dElement.runtime.togglePoints();
        }
    );

    //show all Button
    //$( "#saButton" )
    //.button()
    //.click(function( event ) {
    //    event.preventDefault();
    //    if(event.toElement.type == undefined )
    //    {
    //    document.getElementById('x3dElement').runtime.showAll();
    //    }
    //});

    //reset view button
    $( "#rvButton" )
    .button()
    .click(function( event ) {
        event.preventDefault();
        document.getElementById('x3dElement').runtime.resetView();
        });

    //culling and sorting
    //$("#cullsort").buttonset();
    //
    //$("#cullsort").change(function()
    //    {
    //        var cull = $("#cullChkBtn").attr("checked");
    //        var sort = $("#sortChkBtn").attr("checked");
    //        var popScene = $("#popScene");
    //        popScene[0].setAttribute ("frustumCulling",(cull != undefined )? true: false);
    //        popScene[0].setAttribute("sortTrans",(sort != undefined )? true: false);
    //        });

    //create tooltips
    $(function() {
        $( document ).tooltip();
    });
}

//----------------------------------------------------------------------------------------------------------------------
//document ready
$(document).ready(function()
{
    createGui();
    updateVisibility();
});

document.onload = function()
{
    var x3dElement = document.getElementById('x3dElement');
    x3dElement.runtime.exitFrame = onExitFrame;
    x3dElement.runtime.enterFrame = onEnterFrame;
    
    if (typeof createInstancedScene != "undefined") {
        createInstancedScene();
    }
};
