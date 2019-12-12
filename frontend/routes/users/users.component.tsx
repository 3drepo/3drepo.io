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

import RemoveCircle from '@material-ui/icons/RemoveCircle';
import {
	cond,
	filter,
	isEmpty,
	isEqual,
	isNumber,
	matches,
	pick,
	pickBy,
	values
} from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';

import { TEAMSPACE_PERMISSIONS } from '../../constants/teamspace-permissions';
import { CellSelect } from '../components/customTable/components/cellSelect/cellSelect.component';
import { CellUserSearch } from '../components/customTable/components/cellUserSearch/cellUserSearch.component';
import {
	CustomTable,
	CELL_TYPES,
	TableButton
} from '../components/customTable/customTable.component';
import { FloatingActionPanel } from '../components/floatingActionPanel/floatingActionPanel.component';
import InvitationDialog from '../components/invitationDialog/invitationDialog.container';
import InvitationsDialog from '../components/invitationsDialog/invitationsDialog.container';
import { JobItem } from '../components/jobItem/jobItem.component';
import { Loader } from '../components/loader/loader.component';
import { NewUserForm } from '../components/newUserForm/newUserForm.component';
import { UserItem } from '../components/userItem/userItem.component';
import { UserManagementTab } from '../components/userManagementTab/userManagementTab.component';
import { LoaderContainer } from '../userManagement/userManagement.styles';
import { PendingInvites } from './users.styles';

const USERS_TABLE_CELLS = [
	{
		name: 'User',
		type: CELL_TYPES.USER,
		HeadingComponent: CellUserSearch,
		CellComponent: UserItem,
		searchBy: ['firstName', 'lastName', 'user', 'company']
	},
	{
		name: 'Job',
		CellComponent: CellSelect,
		type: CELL_TYPES.JOB
	},
	{
		name: 'Permissions',
		CellComponent: CellSelect,
		type: CELL_TYPES.PERMISSIONS
	},
	{
		type: CELL_TYPES.EMPTY
	},
	{
		type: CELL_TYPES.ICON_BUTTON,
		CellComponent: TableButton
	}
];

const getPreparedJobs = (jobs) => {
	return jobs.map(({ _id: name, color }) => ({ name, color, value: name }));
};

interface IProps {
	users: any[];
	usersSuggestions: any[];
	projects: any[];
	models: any;
	limit: any;
	jobs: any[];
	licencesCount: number;
	invitationsCount: number;
	userNotExists?: boolean;
	currentTeamspace?: string;
	selectedTeamspace: string;
	addUser: (user) => void;
	removeUser: (username) => void;
	updateUserJob: (username, job) => void;
	updatePermissions: (permissions) => void;
	onUsersSearch: (searchText) => void;
	clearUsersSuggestions: () => void;
	showDialog: (config: any) => void;
	fetchQuotaAndInvitations: (teamspace) => void;
	isPending: boolean;
}

interface IState {
	rows: any[];
	jobs: any[];
	licencesLabel: string;
	containerElement: Node;
	panelKey: number;
	limit: any;
}

const teamspacePermissions = values(TEAMSPACE_PERMISSIONS).map(
	({ label: name, isAdmin: value }: { label: string; isAdmin: boolean }) => ({
		name,
		value
	})
);

export class Users extends React.PureComponent<IProps, IState> {
	public formRef = React.createRef<any>();
	public static defaultProps = {
		jobs: [],
		users: []
	};

	public static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
		return {
			panelKey: nextProps.users.length !== prevState.rows.length ? Math.random() : prevState.panelKey
		};
	}

	public state = {
		rows: [],
		jobs: [],
		licencesLabel: '',
		containerElement: null,
		panelKey: Math.random(),
		limit: 0
	};

	public onPermissionsChange = (username, isAdmin) => {
		const permissionData = {
			user: username,
			permissions: isAdmin ? [TEAMSPACE_PERMISSIONS.admin.key] : []
		};

		this.props.updatePermissions(permissionData);
	}

	public handleChange = (user, field) => (event, value) => cond([
		[matches('job'), () => this.props.updateUserJob(user.user, value)],
		[matches('permissions'), () => this.onPermissionsChange(user.user, value)]
	])(field)

	public onRemove = (username) => {
		this.props.removeUser(username);
	}

	public onSave = ({ name, job, isAdmin = false }) => {
		const user = {
			job,
			user: name,
			permissions: isAdmin ? [TEAMSPACE_PERMISSIONS.admin.key] : []
		};

		this.props.addUser(user);
	}

	public getUsersTableRows = (users = [], jobs = []): any[] => {
		return users.map((user) => {
			const data = [
				pick(user, ['firstName', 'lastName', 'company', 'user']),
				{
					value: user.job,
					items: jobs,
					itemTemplate: JobItem,
					onChange: this.handleChange(user, 'job')
				},
				{
					value: user.isAdmin,
					items: teamspacePermissions,
					onChange: this.handleChange(user, 'permissions'),
					readOnly: user.isCurrentUser || user.isOwner,
					disabled: user.isCurrentUser || user.isOwner
				},
				{},
				{
					Icon: RemoveCircle,
					disabled: user.isCurrentUser || user.isOwner,
					onClick: this.onRemove.bind(null, user.user)
				}
			];
			return { ...user, data };
		});
	}

	public componentDidMount() {
		const containerElement = (ReactDOM.findDOMNode(this) as HTMLElement).parentNode;
		this.props.fetchQuotaAndInvitations(this.props.selectedTeamspace);
		const preparedJobs = getPreparedJobs(this.props.jobs);

		this.setState({
			containerElement,
			jobs: preparedJobs,
			rows: this.getUsersTableRows(this.props.users, preparedJobs),
			limit: this.props.limit
		});
	}

	public componentDidUpdate(prevProps) {
		const changes = {} as any;

		if (prevProps.selectedTeamspace !== this.props.selectedTeamspace) {
			this.props.fetchQuotaAndInvitations(this.props.selectedTeamspace);
		}

		const jobsChanged = !isEqual(prevProps.jobs, this.props.jobs);
		if (jobsChanged) {
			const preparedJobs = getPreparedJobs(this.props.jobs);
			changes.jobs = preparedJobs;
		}

		const usersChanged = !isEqual(prevProps.users, this.props.users);
		if (usersChanged || jobsChanged) {
			changes.rows = this.getUsersTableRows(this.props.users, changes.jobs || this.state.jobs);
		}

		const limitChanged = !isEqual(prevProps.limit, this.props.limit);
		if (limitChanged) {
			changes.limit = this.props.limit;
		}

		const userNotExitstsChanged = prevProps.userNotExists !== this.props.userNotExists;
		if (userNotExitstsChanged && this.formRef.current) {
			this.formRef.current.setUserNotExists(this.props.userNotExists);
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public handleInvitationOpen = (email, job, isAdmin, permissions = []) => {
		this.props.showDialog({
			title: 'Invite user',
			template: InvitationDialog,
			data: {
				email,
				job,
				isAdmin,
				jobs: this.state.jobs,
				projects: pickBy(this.props.projects, ({ teamspace }) => teamspace === this.props.currentTeamspace),
				models: this.props.models,
				permissions,
			},
			DialogProps: {
				maxWidth: false,
			}
		});
	}

	public renderNewUserFormPanel = ({ closePanel }) => {
		const { usersSuggestions, clearUsersSuggestions, onUsersSearch } = this.props;

		const formProps = {
			ref: this.formRef,
			title: this.getFooterLabel(),
			jobs: this.state.jobs,
			users: usersSuggestions,
			onSave: this.onSave,
			clearSuggestions: clearUsersSuggestions,
			getUsersSuggestions: onUsersSearch,
			onInvitationOpen: this.handleInvitationOpen
		};
		return <NewUserForm {...formProps} onCancel={closePanel} />;
	}

	public renderNewUserForm = (container) => {
		const { limit } = this.state;
		const { users } = this.props;

		const isButtonDisabled = limit <= users.length;

		return (
			<FloatingActionPanel
				buttonProps={ {
					disabled: isButtonDisabled,
					label: isButtonDisabled ? 'All licences assigned' : ''
				} }
				container={container}
				key={this.state.panelKey}
				render={this.renderNewUserFormPanel}
			/>
		);
	}

	public renderPendingInvites = () => {
		const { invitationsCount, showDialog } = this.props;
		const onClick = (e: any) => {
			e.preventDefault();
			e.stopPropagation();
			showDialog({
				title: 'Invitations',
				template: InvitationsDialog,
				data: {
					onInvitationOpen: this.handleInvitationOpen,
					projects: filter(this.props.projects, ({ teamspace }) => teamspace === this.props.currentTeamspace),
				}
			});
		};
		return ['(', <PendingInvites key="pending" onClick={onClick}>{invitationsCount} pending</PendingInvites>, ')'];
	}

	/**
	 * Generate licences summary
	 */
	public getFooterLabel = (withInvitations = false) => {
		const { licencesCount, users } = this.props;
		const { limit } = this.state;

		if (!licencesCount) {
			return '';
		}

		const limitValue = isNumber(limit) ? limit : 'unlimited';

		return [
			`Assigned licences: ${users.length} `,
			withInvitations ? this.renderPendingInvites() : null,
			` out of ${limitValue}`
		];
	}

	public render() {
		const { isPending, selectedTeamspace } = this.props;
		const { rows, containerElement } = this.state;

		if (isPending) {
			const content = `Loading "${selectedTeamspace}" users data...`;
			return (
				<LoaderContainer>
					<Loader content={content} />
				</LoaderContainer>
			);
		}

		return (
			<>
				<UserManagementTab footerLabel={this.getFooterLabel(true)}>
					<CustomTable cells={USERS_TABLE_CELLS} rows={rows} />
				</UserManagementTab>
				{containerElement && this.renderNewUserForm(containerElement)}
			</>
		);
	}
}
