// This file acts a way for Webpack to get all the required dependencies in one place
// then compile everything down to one file that the browser can understand

// npm dependencies
import "angular";
import "angular-ui-router";
import "angular-material";
import "angular-sanitize";
import "angular-aria";
import "angular-recaptcha";
import * as io from "socket.io-client";

// TypeScript compiled globals
import { UnityUtil } from "../globals/unity-util";
import { Pin } from "../globals/pin";
import { Viewer } from "../globals/viewer";
import { TDR } from "./init";

window.io = io;
window.UnityUtil = UnityUtil;
window.Viewer = Viewer;
window.Pin = Pin;
window.TDR = TDR;

// Initialise 3D Repo
window.TDR();

// Register all the angularjs modules
import "./account/js/account-assign.component";
import "./account/js/account-billing.component";
import "./account/js/account.component";
import "./account/js/account-federations.component";
import "./account/js/account-info.component";
import "./account/js/account-items.component";
import "./account/js/account-licenses.component";
import "./account/js/account-menu.component";
import "./account/js/account-model.component";
import "./account/js/account-modelsetting.component";
import "./account/js/account-profile.component";
import "./account/js/account.service";
import "./account/js/account-teamspaces.component";
import "./account/js/account-upload.service";
import "./bottom-buttons/js/bottom-buttons.component";
import "./clip/js/clip.component";
import "./clip/js/clip.service";
import "./compare/js/compare.component";
import "./compare/js/compare.service";
import "./cookies/js/cookies.component";
import "./docs/js/docs.component";
import "./docs/js/docs.service";
import "./gis/js/gis.component";
import "./gis/js/gis.service";
import "./groups/js/groups.component";
import "./groups/js/groups.service";
import "./home/js/analytic.service";
import "./home/js/api.service";
import "./home/js/auth.interceptor";
import "./home/js/auth.service";
import "./home/js/client-config.service";
import "./home/js/dialog.service";
import "./home/js/event.service";
import "./home/js/home.component";
import "./home/js/notifications/notification.service";
import "./home/js/serviceworker.service";
import "./home/js/state-manager.config";
import "./home/js/state-manager.run";
import "./home/js/state-manager.service";
import "./home/js/template.service";
import "./home/js/theme.config";
import "./icons/js/icons.constant.ts";
import "./issues/js/issue.component";
import "./issues/js/issues.component";
import "./issues/js/issue-screen-shot.component";
import "./issues/js/issues-list.component";
import "./issues/js/issues.service";
import "./login/js/login.component";
import "./measure/js/measure.service";
import "./model/js/model.component";
import "./panel/js/panel-card.component";
import "./panel/js/panel-card-filter.component";
import "./panel/js/panel-card-option-close.component";
import "./panel/js/panel-card-option-filter.component";
import "./panel/js/panel-card-option-menu.component";
import "./panel/js/panel-card-option-visible.component";
import "./panel/js/panel.component";
import "./panel/js/panel.service";
import "./password-change/js/password-change.component";
import "./password-change/js/password.service";
import "./password-forgot/js/password-forgot.component";
import "./payment/js/payment.component";
import "./privacy/js/privacy.component";
import "./register-request/js/register-request.component";
import "./register-verify/js/register-verify.component";
import "./revisions/js/revisions.component";
import "./revisions/js/revisions.service";
import "./right-panel/js/right-panel.component";
import "./sign-up/js/sign-up.component";
import "./terms/js/terms.component";
import "./tree/js/tree.component";
import "./tree/js/tree.service";
import "./utils/js/progress.component";
import "./utils/js/tdr-focus.component";
import "./utils/js/utils.filter";
import "./viewer/js/multi-select.service";
import "./viewer/js/viewer.component";
import "./viewer/js/viewer.service";
import "./viewpoints/js/viewpoints.component";
import "./viewpoints/js/viewpoints.service";

// Kickstart the application
angular.bootstrap(document.body, ["3drepo"], { strictDi: true });
