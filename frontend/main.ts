// This file acts a way for Webpack to get all the required dependencies in one place
// then compile everything down to one file that the browser can understand
import 'angular';
import 'angular-ui-router';
import 'angular-material';
import 'angular-sanitize';
import 'angular-aria';
import 'angular-recaptcha';
import * as io from 'socket.io-client';
import 'simplebar';
import 'ngclipboard';

const requireAll = (r) => r.keys().forEach(r);

// @ts-ignore
requireAll(require.context('./css', true, /\.css$/));

// css from libs
import 'simplebar/dist/simplebar.min.css';
import 'angular-material/angular-material.min.css';
import 'font-awesome/css/font-awesome.min.css';
import './services/fontAwesome';

// TypeScript compiled globals
import { UnityUtil } from './globals/unity-util';
import { Pin } from './globals/pin';
import { Viewer } from './globals/viewer';
import { TDR } from './components/init';

window.io = io;
window.UnityUtil = UnityUtil;
window.Viewer = Viewer;
window.Pin = Pin;
window.TDR = TDR;

// Initialise 3D Repo
window.TDR();

// Register all the angularjs modules
import './components';

// React components
import './routes/angularBindings';

// @ts-ignore
requireAll(require.context('./components', true, /\.css$/));
// @ts-ignore
requireAll(require.context('./components', true, /\.pug$/));

// Kickstart the application
angular.bootstrap(document.body, ['3drepo'], { strictDi: true });
