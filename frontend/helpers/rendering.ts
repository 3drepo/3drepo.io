import { result } from 'lodash';

export const renderWhenTrue = (Component: JSX.Element | (() => JSX.Element)) => (trueStatement: boolean) => {
	return trueStatement ? result({ Component }, 'Component') : null;
};
