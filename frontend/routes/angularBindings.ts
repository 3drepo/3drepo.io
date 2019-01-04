/*
	This file contains react components conversion to angular context.
	It should be change to ReactRouter file if app is fully migrated
*/
import { react2angular as wrap } from 'react2angular';

// Routes
import App from './app/app.container';
import ModelSettings from './modelSettings/modelSettings.container';
import Login from './login/login.container';
import PasswordForgot from './passwordForgot/passwordForgot.container';
import PasswordChange from './passwordChange/passwordChange.container';
import RegisterRequest from './registerRequest/registerRequest.container';
import RegisterVerify from './registerVerify/registerVerify.container';
import SignUp from './signUp/signUp.container';
import StaticPageViewer from './staticPageViewer/staticPageViewer.container';

// Components
import Dashboard from './dashboard/dashboard.container';
import TopMenu from './components/topMenu/topMenu.container';
import Gis from './viewer/components/gis/gis.container';
import Views from './viewer/components/views/views.container';
import Risks from './viewer/components/risks/risks.container';

angular
	.module('3drepo')
	.component('app', wrap(App))
	.component('dashboard', wrap(Dashboard))
	.component('topMenu', wrap(TopMenu, ['isLiteMode', 'logoUrl', 'onLiteModeChange', 'onLogoClick']))
	.component('modelSettings', wrap(ModelSettings))
	.component('login', wrap(Login, ['headlineText']))
	.component('passwordForgot', wrap(PasswordForgot))
	.component('passwordChange', wrap(PasswordChange))
	.component('registerRequest', wrap(RegisterRequest))
	.component('registerVerify', wrap(RegisterVerify))
	.component('signUp', wrap(SignUp, ['onLogoClick']))
	.component('staticPageViewer', wrap(StaticPageViewer))
	.component('viewerPanel', wrap(ViewerPanel))
	.component('gis', wrap(Gis))
    .component('risks', wrap(Risks, ['teamspace', 'model', 'revision']))
	.component('views', wrap(Views, ['teamspace', 'modelId']));
