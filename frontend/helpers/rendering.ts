import { result } from 'lodash';

export const getWindowWidth = () =>
	window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

export const getWindowHeight = () =>
	window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

export const renderWhenTrue = (Component: JSX.Element | (() => JSX.Element)) => (trueStatement: boolean) => {
<<<<<<< HEAD
	return (trueStatement ? result({ Component }, 'Component') : null) as JSX.Element;
=======
	return trueStatement ? result({ Component }, 'Component') : null;
>>>>>>> ISSUE #1273 - Handle panel
};
