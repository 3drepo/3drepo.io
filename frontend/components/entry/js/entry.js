// Eventually we won't need this as we will get the config/plugin structure statically rather than dynamically through pug
if (!_PUG_VARS) {
    console.error("_PUG_VARS is genrated in the pug/frotend.pug file. It should be defined")
}

angular.module('3drepo', ['ui.router', 'ngMaterial', 'ngAnimate', 'ngSanitize', 'vcRecaptcha'])
        .constant('structure', _PUG_VARS.structure)
        .constant('parentStates',  _PUG_VARS.parentStateJSON)
        .constant('uiState',  _PUG_VARS.uiState);

        