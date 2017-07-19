// Eventually we won't need this as we will get the config/plugin structure statically rather than dynamically through pug
if (!SERVER_VARS) {
	console.error("SERVER_VARS is generated in the pug/frotend.pug file. It should be defined");
}

angular.module("3drepo", ["ui.router", "ngMaterial", "ngAnimate", "ngSanitize", "vcRecaptcha"])
	.constant("structure", SERVER_VARS.structure)
	.constant("parentStates",  SERVER_VARS.parentStateJSON)
	.constant("uiState",  SERVER_VARS.uiState);

        