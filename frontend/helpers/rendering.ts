import { result } from 'lodash';

export const getWindowWidth = () =>
	window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

export const getWindowHeight = () =>
	window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

export const renderWhenTrue = (
	Component: JSX.Element | JSX.Element[] | (() => JSX.Element | JSX.Element[])
) => (trueStatement) => {
	return (trueStatement ? result({ Component }, 'Component') : null) as JSX.Element | JSX.Element[];
};

export const renderWhenTrueOtherwise =
	(
		ComponentTrue: JSX.Element | (() => JSX.Element),
		ComponentFalse: JSX.Element | (() => JSX.Element)
	) => (trueStatement) => {
	return (
		trueStatement ?
		result({ ComponentTrue }, 'ComponentTrue') :
		result({ ComponentFalse }, 'ComponentFalse')
	) as JSX.Element | JSX.Element[];
};
