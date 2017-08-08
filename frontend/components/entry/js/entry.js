// Eventually we won't need this as we will get the config/plugin structure statically rather than dynamically through pug
if (!ClientConfig) {
	console.error("ClientConfig is generated in the pug/frontend.pug file. It should be defined.");
}

angular.module("3drepo", ["ui.router", "ngMaterial", "ngAnimate", "ngSanitize", "vcRecaptcha"]);