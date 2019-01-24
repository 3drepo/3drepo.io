export const renderWhenTrue = (Component: JSX.Element) => (trueStatement: boolean) => {
	return trueStatement ? Component : null;
};
