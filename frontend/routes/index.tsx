import * as React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

import { App } from './app';

export class RootContainer extends React.Component {
	public render() {
		return (
			<Switch>
				<Route path="/" component={App} />
				{/* <Route exact path="/404" component={NotFound} /> */}
			</Switch>
		);
	}
}

export default withRouter(RootContainer);
