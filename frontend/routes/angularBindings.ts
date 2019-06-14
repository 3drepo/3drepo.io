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
import Gis from './viewerGui/components/gis/gis.container';
import Views from './viewerGui/components/views/views.container';
import Risks from './viewerGui/components/risks/risks.container';
import Groups from './viewerGui/components/groups/groups.container';
import Toolbar from './viewerGui/components/toolbar/toolbar.container';
import PanelsMenu from './viewerGui/components/panelsMenu/panelsMenu.container';
import { PanelButton } from './viewerGui/components/panelButton/panelButton.component';
import CloseFocusModeButton from './viewerGui/components/closeFocusModeButton/closeFocusModeButton.container';
import Bim from './viewerGui/components/bim/bim.container';
import Issues from './viewerGui/components/issues/issues.container';
import Compare from './viewerGui/components/compare/compare.container';
import Tree from './viewerGui/components/tree/tree.container';
import { ViewerGui } from './viewerGui';

angular
	.module('3drepo')
	.component('app', wrap(App))
	.component('dashboard', wrap(Dashboard))
	.component('topMenu', wrap(TopMenu, ['logoUrl', 'onLogoClick']))
	.component('modelSettings', wrap(ModelSettings))
	.component('login', wrap(Login, ['headlineText']))
	.component('passwordForgot', wrap(PasswordForgot))
	.component('passwordChange', wrap(PasswordChange))
	.component('registerRequest', wrap(RegisterRequest))
	.component('registerVerify', wrap(RegisterVerify))
	.component('signUp', wrap(SignUp, ['onLogoClick']))
	.component('staticPageViewer', wrap(StaticPageViewer))
	.component('gis', wrap(Gis))
	.component('risks', wrap(Risks, ['teamspace', 'model', 'revision']))
	.component('views', wrap(Views, ['teamspace', 'modelId']))
	.component('groups', wrap(Groups, ['teamspace', 'model', 'revision']))
	.component('toolbar', wrap(Toolbar, ['teamspace', 'model']))
	.component('panelsMenu', wrap(PanelsMenu))
	.component('closeFocusModeButton', wrap(CloseFocusModeButton))
	.component('panelButton', wrap(PanelButton, ['onClick', 'label', 'icon', 'active', 'type']))
	.component('bim', wrap(Bim, ['teamspace', 'model']))
	.component('issues', wrap(Issues, ['teamspace', 'model', 'revision']))
	.component('compare', wrap(Compare, ['teamspace', 'model', 'revision']))
	.component('tree', wrap(Tree, ['teamspace', 'model', 'revision']))
	.component('viewerGui', wrap(ViewerGui));
