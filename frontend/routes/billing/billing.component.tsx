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

import * as React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import * as queryString from 'query-string';
import { Panel } from '../components/panel/panel.component';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Subscription from './../subscription/subscription.container';
import History from './../history/history.container';
import { Header, TabContent } from './billing.styles';

export const TABS_TYPES = {
  SUBSCRIPTION: 0,
  HISTORY: 1,
};

const TABS = {
	[TABS_TYPES.SUBSCRIPTION]: {
		id: TABS_TYPES.SUBSCRIPTION,
    label: "Subscription"
  },
	[TABS_TYPES.HISTORY]: {
		id: TABS_TYPES.HISTORY,
    label: "History"
  },
};

interface IProps {
	location: any;
	history: any;
}

interface IState {
	activeTab: number;
}

export class Billing extends React.PureComponent<IProps, IState> {
	public state = {
		activeTab: TABS_TYPES.SUBSCRIPTION,
	};

	public updateUrlParams = (params) => {
		const { pathname, search } = this.props.location;
		const queryParams = Object.assign({}, queryString.parse(search), params);
		const updatedQueryString = queryString.stringify(queryParams);
		this.props.history.push(`${pathname}?${updatedQueryString}`);
	}

	public handleChange = (event, activeTab) => {
		this.updateUrlParams({ tab: activeTab });
		this.setState({ activeTab });
	}

	public renderTabContent = () => {
		const { activeTab } = this.state;

		return (
			<>
				{ activeTab === TABS_TYPES.SUBSCRIPTION && <Subscription /> }
				{ activeTab === TABS_TYPES.HISTORY && <History /> }
			</>
		);
	}

	public render() {
		const { activeTab } = this.state;
		const paperProps = { height: "100%" };

		return (
			<Panel title="Billing" paperProps={paperProps}>
        <Header>
          <Tabs value={activeTab} indicatorColor="primary" textColor="primary" onChange={this.handleChange}>
						<Tab label="Subscription" />
						<Tab label="History" />
          </Tabs>
        </Header>
        <TabContent>
					{/* TODO: This should be splitted to multiple routes after setup proper url's approach */}
					<Route render={this.renderTabContent}></Route>
        </TabContent>
      </Panel>
		);
	}
}
