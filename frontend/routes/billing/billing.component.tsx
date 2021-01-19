/**
 *  Copyright (C) 2017 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import Tabs from '@material-ui/core/Tabs';
import { values } from 'lodash';
import * as queryString from 'query-string';
import React from 'react';
import { Link, Redirect, Route, Switch } from 'react-router-dom';

import { Panel } from '../components/panel/panel.component';
import History from './../history/history.container';
import Subscription from './../subscription/subscription.container';
import { Header, StyledTab, TabContent } from './billing.styles';

const TABS = {
	SUBSCRIPTION: {
		label: 'Subscription',
		path: 'subscription',
		component: Subscription
	},
	HISTORY: {
		label: 'History',
		path: 'history',
		component: History
	}
};

const TABS_ROUTES = values(TABS);

interface IProps {
	match: any;
	location: any;
	history: any;
}

interface IState {
	activeTab: string;
}

export class Billing extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps = (nextProps, prevState) => {
		const queryParams = queryString.parse(location.search);
		const activeTab = Number(queryParams.tab || prevState.activeTab);
		return { activeTab };
	}

	public state = {
		activeTab: TABS.SUBSCRIPTION.path
	};

	public handleChange = (event, activeTab) => {
		this.setState({ activeTab });
	}

	public renderRoute = ({ match }) => {
		const { activeTab } = this.state;

		return (
			<>
				<Header>
					<Tabs
						value={activeTab || match.params.tab}
						indicatorColor="primary"
						textColor="primary"
						onChange={this.handleChange}
					>
						{ TABS_ROUTES.map(({ label, path }, index) => {
							const props = {
								label,
								component: Link,
								value: path,
								to: `${this.props.match.url}/${path}`
							};
							return <StyledTab key={index} {...props} />;
						})}
					</Tabs>
				</Header>
				<TabContent>
					<Switch>
						{ TABS_ROUTES.map(({ path, component: Component }, index) => (
							<Route key={index} path={`${this.props.match.url}/${path}`} component={Component} />
						))}
					</Switch>
				</TabContent>
			</>
		);
	}

	public render() {
		const { match } = this.props;
		const paperProps = { height: '100%' };

		return (
			<Panel title="Billing" paperProps={paperProps}>
				<Switch>
					<Route path={`${match.url}/:tab`} render={this.renderRoute} />
					<Redirect exact from={`${match.url}`} to={`${match.url}/${TABS.SUBSCRIPTION.path}`} />
				</Switch>
			</Panel>
		);
	}
}
