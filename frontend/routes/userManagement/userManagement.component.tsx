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
import { Route, Switch, Link, Redirect } from 'react-router-dom';
import { isEqual, isEmpty } from 'lodash';
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
	onTeamspaceChange: (teamspace) => void;
	fetchTeamspaces: (username) => void;
}

interface IState {
	activeTab: string;
	selectedTeamspace: string;
	teamspacesItems: any[];
}

export class UserManagement extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps = (nextProps, prevState) => {
		return {
			selectedTeamspace: nextProps.match.params.teamspace || prevState.selectedTeamspace
		};
	}

	public state = {
		activeTab: USERS_TAB.path,
		selectedTeamspace: '',
		teamspacesItems: []
	};

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
		const { teamspaces, defaultTeamspace, match, history, currentUser } = this.props;
		const { activeTab } = this.state;
		const selectedTeamspace = match.params.teamspace;

		if (teamspaces.length === 0) {
			this.props.fetchTeamspaces(currentUser.username);
		}

		const changes = {
			teamspacesItems: teamspaces.map(({ account }) => ({ value: account }))
		} as any;

		const teamspaceData = teamspaces.find(({ account }) => account === selectedTeamspace);
		const teamspace = teamspaceData ? selectedTeamspace : defaultTeamspace;

		// Redirect to projects tab if user has not admin rights
		if (teamspaceData && !teamspaceData.isAdmin && ADMIN_TABS.includes(activeTab)) {
			changes.activeTab = PROJECTS_TAB.path;
			history.push(`${match.url}/${PROJECTS_TAB.path}`);
		} else {
			changes.activeTab = location.pathname.replace(`${match.url}/`, '');
		}

		this.props.onTeamspaceChange(teamspace);
		this.setState(changes);
	}

	public componentDidUpdate(prevProps) {
		const changes = {} as IState;
		const {teamspaces, match, onTeamspaceChange} = this.props;

		const teamspacesChanged = !isEqual(teamspaces, prevProps.teamspaces);

		if (teamspacesChanged) {
			changes.teamspacesItems = teamspaces.map(({account}) => ({value: account}));
			onTeamspaceChange(match.params.teamspace);
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public renderTabContent = () => {
		const {isLoadingTeamspace, isTeamspaceAdmin, match} = this.props;
		const {selectedTeamspace, activeTab} = this.state;

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
					<Route key={index} exact={true} path={`${match.path}/${path}`} component={Component} />
				))}
			</Switch>
		);
	}

	public renderUserManagementRoute = () => {
		const { match: userManagmentMatch, isLoadingTeamspace, isTeamspaceAdmin } = this.props;
		const { teamspacesItems, activeTab } = this.state;
		const selectedTeamspace = userManagmentMatch.params.teamspace;
		const isTabDisabled = Boolean(!selectedTeamspace || isLoadingTeamspace);
		return (
			<>
				<Header>
					<TeamspaceSelectContainer>
						<FormControl fullWidth={true}>
							<InputLabel shrink={true} htmlFor="teamspace-select">Teamspace</InputLabel>
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

								return <Tab key={index} {...props} component={Link} />;
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
						exact={true}
						from={`${userManagmentMatch.url}`}
						to={`${userManagmentMatch.url}/users`}
					/>
				</Switch>
			</Panel>
		);
	}
}
