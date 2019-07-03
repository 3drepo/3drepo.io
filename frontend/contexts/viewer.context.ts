import * as React from 'react';
import { Viewer } from '../services/viewer/viewer';

export interface IViewerContext {
	init: (container, name?) => void;
	destroy: () => void;
	on: (eventName, callback) => void;
	once: (eventName, callback) => void;
	off: (eventName) => void;
	getCurrentViewpoint: (params) => Promise<any>;
}
export const ViewerContext = React.createContext({
	init: Viewer.init,
	destroy: Viewer.destroy,
	on: Viewer.on,
	off: Viewer.off,
	once: Viewer.once,
	getCurrentViewpoint: Viewer.getCurrentViewpoint
} as IViewerContext);
