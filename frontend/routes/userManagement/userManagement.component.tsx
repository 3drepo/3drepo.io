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

import React from 'react';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Tabs from '@material-ui/core/Tabs';
import { isEmpty, isEqual } from 'lodash';
import { Link, Redirect, Route, Switch } from 'react-router-dom';

import { CellSelect } from '../components/customTable/components/cellSelect/cellSelect.component';
import { Loader } from '../components/loader/loader.component';
import { Panel } from '../components/panel/panel.component';
import { TextOverlay } from '../components/textOverlay/textOverlay.component';
import Jobs from '../jobs/jobs.container';
import Projects from '../projects/projects.container';
import Users from '../users/users.container';
import {
	Header,
	LoaderContainer,
	StyledTab,
	TabContent,
	TeamspaceSelectContainer
} from './userManagement.styles';

export const USERS_TAB = {
	label: 'Users',
	path: 'users',
	isAdminOnly: true,
	component: Users
};

export const PROJECTS_TAB = {
	label: 'Projects',
	path: 'projects',
	component: Projects,
	isAdminOnly: false
};

export const JOBS_TAB = {
	label: 'Jobs',
	path: 'jobs',
	isAdminOnly: true,
	component: Jobs
};

const TABS_ROUTES = [
	USERS_TAB,
	PROJECTS_TAB,
	JOBS_TAB
];

const ADMIN_TABS = [USERS_TAB.path, JOBS_TAB.path] as any;

interface IProps {
	match: any;
	location: any;
	history: any;
	defaultTeamspace: string;
	teamspaces: any[];
	isLoadingTeamspace: boolean;
	isTeamspaceAdmin: boolean;
	currentUser: {username: string};
	fetchTeamspacesIfNecessary: (username) => void;
	fetchUsers: () => void;
	selectedTeamspace: string;
}

interface IState {
	activeTab: string;
	teamspacesItems: any[];
}

export class UserManagement extends React.PureComponent<IProps, IState> {
	public state = {
		activeTab: USERS_TAB.path,
		teamspacesItems: []
	};

	public handleChange = (event, activeTab) => {
		this.setState({ activeTab });
	}

	public onTeamspaceChange = (event, teamspace) => {
		const { match, location } = this.props;
		const newRoute = location.pathname.replace(match.params.teamspace, teamspace);
		this.props.history.push(newRoute);
	}

	public componentDidMount() {
		const { teamspaces, match, history, currentUser, selectedTeamspace } = this.props;
		const { activeTab } = this.state;

		this.props.fetchTeamspacesIfNecessary(currentUser.username);

		if (selectedTeamspace) {
			this.props.fetchUsers();
		}

		const changes = {
			teamspacesItems: teamspaces.map(({ account }) => ({ value: account }))
		} as any;

		changes.activeTab = location.pathname.replace(`${match.url}/`, '');

		const teamspaceData = teamspaces.find(({ account }) => account === selectedTeamspace);

		// Redirect to projects tab if user has not admin rights
		if (teamspaceData && !teamspaceData.isAdmin && ADMIN_TABS.includes(changes.activeTab )) {
			changes.activeTab = PROJECTS_TAB.path;
			history.push(`${match.url}/${PROJECTS_TAB.path}`);
		}

		this.setState(changes);
	}

	public componentDidUpdate(prevProps) {
		const changes = {} as IState;
		const {teamspaces, selectedTeamspace} = this.props;

		if (prevProps.selectedTeamspace !== selectedTeamspace) {
			this.props.fetchUsers();
		}

		const teamspacesChanged = !isEqual(teamspaces, prevProps.teamspaces);

		if (teamspacesChanged) {
			changes.teamspacesItems = teamspaces.map(({account}) => ({value: account}));
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public renderTabContent = () => {
		const {isLoadingTeamspace, isTeamspaceAdmin, match, selectedTeamspace} = this.props;
		const { activeTab } = this.state;

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

		if (ADMIN_TABS.includes(activeTab) && !isTeamspaceAdmin) {
			return <TextOverlay content="Not allowed to access this page" />;
		}

		return (
			<Switch>
				{ TABS_ROUTES.map(({path, component: Component}, index) => (
					<Route key={index} exact path={`${match.path}/${path}`} component={Component} />
				))}
			</Switch>
		);
	}

	public renderUserManagementRoute = () => {
		const { match: userManagmentMatch, isLoadingTeamspace, isTeamspaceAdmin, selectedTeamspace } = this.props;
		const { teamspacesItems, activeTab } = this.state;
		const isTabDisabled = Boolean(!selectedTeamspace || isLoadingTeamspace);
		return (
			<>
				<Header>
					<TeamspaceSelectContainer>
						<FormControl fullWidth>
							<InputLabel shrink htmlFor="teamspace-select">Teamspace</InputLabel>
							<CellSelect
								items={teamspacesItems}
								value={selectedTeamspace}
								placeholder="Select teamspace"
								disabledPlaceholder
								onChange={this.onTeamspaceChange}
								inputId="teamspace-select"
							/>
						</FormControl>
					</TeamspaceSelectContainer>
					<Tabs
						value={activeTab}
						indicatorColor="primary"
						textColor="primary"
						onChange={this.handleChange}
					>
						{
							TABS_ROUTES.map(({ label, path, isAdminOnly }, index) => {
								const props = {
									key: index,
									label,
									to: `${userManagmentMatch.url}/${path}`,
									value: path,
									disabled: isTabDisabled || (isAdminOnly && !isTeamspaceAdmin)
								};

								return <StyledTab key={index} {...props} component={Link} />;
							})}
					</Tabs>
				</Header>
				<TabContent>
					{this.renderTabContent()}
				</TabContent>
			</>
		);
	}

	public render() {
		const {match: userManagmentMatch} = this.props;
		const paperProps = { height: '100%' };

		return (
			<Panel title="User management" paperProps={paperProps}>
				<Switch>
					<Route path={`${userManagmentMatch.url}/:tab`} render={this.renderUserManagementRoute} />
					<Redirect
						exact
						from={`${userManagmentMatch.url}`}
						to={`${userManagmentMatch.url}/users`}
					/>
				</Switch>
			</Panel>
		);
	}
}
