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
import { Route, Switch, Link } from 'react-router-dom';
import * as queryString from 'query-string';
import { isEqual, isEmpty, isUndefined } from 'lodash';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

import Users from '../users/users.container';
import Jobs from '../jobs/jobs.container';
import Projects from '../projects/projects.container';
import { CellSelect } from '../components/customTable/components/cellSelect/cellSelect.component';
import { TextOverlay } from '../components/textOverlay/textOverlay.component';
import { Loader } from '../components/loader/loader.component';
import { Panel } from '../components/panel/panel.component';

import {
	Header,
	TabContent,
	TeamspaceSelectContainer,
	LoaderContainer
} from './userManagement.styles';

export const TABS_TYPES = {
	USERS: 0,
	PROJECTS: 1,
	JOBS: 2
};

const TABS_ROUTES = [{
	label: 'Users',
	path: '/users',
	isAdminOnly: true,
	component: Users
},
{
	label: 'Projects',
	path: '/projects',
	component: Projects,
	isAdminOnly: false
},
{
	label: 'Jobs',
	path: '/jobs',
	isAdminOnly: true,
	component: Jobs
}];

interface IProps {
	match: any;
	location: any;
	history: any;
	defaultTeamspace: string;
	teamspaces: any[];
	isLoadingTeamspace: boolean;
	isTeamspaceAdmin: boolean;
	onTeamspaceChange: (teamspace) => void;
}

interface IState {
	activeTab: number;
	selectedTeamspace: string;
	teamspacesItems: any[];
}

export class UserManagement extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps = (nextProps, prevState) => {
		const queryParams = queryString.parse(location.search);
		const activeTab = Number(queryParams.tab || prevState.activeTab);
		const initialTab = isUndefined(nextProps.isTeamspaceAdmin) ? TABS_TYPES.USERS : TABS_TYPES.PROJECTS;
		return {
			activeTab: nextProps.isTeamspaceAdmin ? activeTab : initialTab,
			selectedTeamspace: nextProps.match.params.teamspace || prevState.selectedTeamspace
		};
	}

	public state = {
		activeTab: TABS_TYPES.USERS,
		selectedTeamspace: '',
		teamspacesItems: []
	};

	public updateUrlParams = (params) => {
		const { pathname, search } = this.props.location;
		const queryParams = Object.assign({}, queryString.parse(search), params);
		const updatedQueryString = queryString.stringify(queryParams);

		this.props.history.push(`${pathname}?${updatedQueryString}`);
	}

	public handleChange = (event, activeTab) => {
		this.setState({activeTab});
	}

	public onTeamspaceChange = (event, teamspace) => {
		const { match, location, onTeamspaceChange } = this.props;
		const newRoute = location.pathname.replace(match.params.teamspace, teamspace);

		this.props.history.push(newRoute);
		if (onTeamspaceChange) {
			onTeamspaceChange(teamspace);
		}
	}

	public componentDidMount() {
		const {teamspaces, defaultTeamspace, match} = this.props;
		const selectedTeamspace = match.params.teamspace;
		const changes = {
			teamspacesItems: teamspaces.map(({ account }) => ({ value: account }))
		} as any;

		const teamspaceData = teamspaces.find(({ account }) => account === selectedTeamspace);
		const teamspace = teamspaceData ? selectedTeamspace : defaultTeamspace;

		this.setState(changes);
		this.onTeamspaceChange(null, teamspace);
	}

	public componentDidUpdate(prevProps) {
		const changes = {} as IState;

		const teamspacesChanged = !isEqual(this.props.teamspaces, prevProps.teamspaces);
		if (teamspacesChanged) {
			changes.teamspacesItems = this.props.teamspaces.map(({account}) => ({value: account}));
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public renderTabContent = () => {
		const {isLoadingTeamspace, isTeamspaceAdmin, match} = this.props;
		const {activeTab, selectedTeamspace} = this.state;

		if (!selectedTeamspace) {
			return <TextOverlay content="Select teamspace to enable settings" />;
		}

		if (isLoadingTeamspace) {
			const content = `Loading "${selectedTeamspace}" data...`;
			return (
				<LoaderContainer>
					<Loader content={content} />
				</LoaderContainer>
			);
		}

/* 		if (ADMIN_TABS.includes(activeTab) && !isTeamspaceAdmin) {
			return <TextOverlay content="Not allowed to access this page" />;
		} */

		return (
			<Switch>
				{TABS_ROUTES.map(({path, component: Component}, index) => (
					<Route key={index} exact path={`${match.path}${path}`} component={Component} />
				))}
			</Switch>
		);
	}

	public render() {
		const {match, location, isLoadingTeamspace, isTeamspaceAdmin} = this.props;
		const {teamspacesItems} = this.state;

		const selectedTeamspace = match.params.teamspace;
		const paperProps = { height: '100%' };
		const isTabDisabled = Boolean(!selectedTeamspace || isLoadingTeamspace);

		return (
			<Panel title="User management" paperProps={paperProps}>
				<Header>
					<TeamspaceSelectContainer>
						<FormControl fullWidth={true}>
							<InputLabel shrink htmlFor="teamspace-select">Teamspace</InputLabel>
							<CellSelect
								items={teamspacesItems}
								value={selectedTeamspace}
								placeholder="Select teamspace"
								disabledPlaceholder={true}
								onChange={this.onTeamspaceChange}
								inputId="teamspace-select"
							/>
						</FormControl>
					</TeamspaceSelectContainer>
					<Tabs
						value={location.pathname}
						indicatorColor="primary"
						textColor="primary"
						onChange={this.handleChange}
					>
						{
							TABS_ROUTES.map(({ label, path, isAdminOnly }, index) => {
								const props = {
									label,
									to: `${match.url}${path}`,
									disabled: isTabDisabled || (isAdminOnly && !isTeamspaceAdmin)
								};

								return (
									<Tab
										{...props}
										key={index}
										value={props.to}
										component={Link}
									/>
								);
							})
						}
					</Tabs>
				</Header>
				<TabContent>
					{this.renderTabContent()}
				</TabContent>
			</Panel>
		);
	}
}
