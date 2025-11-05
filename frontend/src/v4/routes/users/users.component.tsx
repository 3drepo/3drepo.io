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
import { PureComponent, createRef } from 'react';
import BinIcon from '@assets/icons/outlined/delete-outlined.svg';
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
import { PendingInvitesLink } from './users.styles';

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
	currentTeamspace: string;
	selectedTeamspace: string;
	usersProvisionedEnabled: boolean;
	permissionsOnUIDisabled: boolean;
	addUser: (user) => void;
	removeUser: (username) => void;
	updateUserJob: (username, job) => void;
	updatePermissions: (permissions) => void;
	onUsersSearch: (searchText) => void;
	clearUsersSuggestions: () => void;
	showDialog: (config: any) => void;
	fetchQuotaAndInvitations: (teamspace) => void;
	isPending: boolean;
	className?: string;
	isTeamspaceAdmin?: boolean;
}

interface IState {
	rows: any[];
	jobs: any[];
	licencesLabel: string;
	containerElement: Node;
	panelKey: number;
	limit: string | number;
}

const teamspacePermissions = values(TEAMSPACE_PERMISSIONS).map(
	({ label: name, isAdmin: value }: { label: string; isAdmin: boolean }) => ({
		name,
		value
	})
);

const PendingInvites = ({ invitationsCount, showDialog, projects, currentTeamspace, onInvitationOpen, limitReached }) => {
	const onClick = (e: any) => {
		e.preventDefault();
		e.stopPropagation();

		showDialog({
			title: 'Invitations',
			template: InvitationsDialog,
			data: {
				onInvitationOpen,
				projects: filter(projects, ({ teamspace }) => teamspace === currentTeamspace),
				limitReached
			}
		});
	};

	return <>(<PendingInvitesLink key="pending" onClick={onClick}>{invitationsCount ?? 0} pending</PendingInvitesLink>)</>;
}

type AssignedLicensesProps = {
	licencesCount: number,
	usersCount: number,
	limit: number | string,
	children?: JSX.Element
};

const AssignedLicenses = ({ licencesCount, usersCount, limit, children}: AssignedLicensesProps ) => {
	if (!licencesCount) {
		return <></>;
	}

	const limitValue = limit !== 'unlimited' ? limit || 0 : 'unlimited';

	return (<>
		Assigned licences: {usersCount} {children} out of {limitValue}
	</>);
}

export class Users extends PureComponent<IProps, IState> {
	public formRef = createRef<any>();
	public static defaultProps = {
		jobs: [],
		users: []
	};

	public static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
		return {
			panelKey: nextProps.users.length !== prevState.rows.length ? Math.random() : prevState.panelKey
		};
	}

	public state: IState = {
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
					onChange: this.handleChange(user, 'job'),
					disabled: this.props.usersProvisionedEnabled,
				},
				{
					value: user.isAdmin,
					items: teamspacePermissions,
					onChange: this.handleChange(user, 'permissions'),
					readOnly: user.isCurrentUser || user.isOwner || this.props.permissionsOnUIDisabled,
					disabled: user.isCurrentUser || user.isOwner || this.props.permissionsOnUIDisabled
				},
				{},
			];
			if (!this.props.usersProvisionedEnabled) {
				data.push({
					// @ts-ignore
					Icon: BinIcon,
					disabled: user.isCurrentUser || user.isOwner,
					onClick: this.onRemove.bind(null, user.user)
				});
			}
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
		const { usersSuggestions, clearUsersSuggestions, onUsersSearch, licencesCount, limit, users } = this.props;

		const formProps = {
			ref: this.formRef,
			title: <AssignedLicenses licencesCount={licencesCount} limit={limit} usersCount={users.length} />,
			jobs: this.state.jobs,
			users: usersSuggestions,
			usersProvisionedEnabled: this.props.usersProvisionedEnabled,
			permissionsOnUIDisabled: this.props.permissionsOnUIDisabled,
			onSave: this.onSave,
			clearSuggestions: clearUsersSuggestions,
			getUsersSuggestions: onUsersSearch,
			onInvitationOpen: (email, job, isAdmin) => {
				this.handleInvitationOpen(email, job, isAdmin);
				closePanel();
			}
		};
		return <NewUserForm {...formProps} onCancel={closePanel} />;
	}

	public renderNewUserForm = (container) => {
		const { limit } = this.state;
		const { users, usersProvisionedEnabled } = this.props;

		const isButtonDisabled = (limit || 0) as number <= users.length;

		if (usersProvisionedEnabled) {
			return null;
		}

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

	public render() {
		const { isPending, selectedTeamspace, usersProvisionedEnabled } = this.props;
		const { rows, containerElement } = this.state;
		const cells = USERS_TABLE_CELLS;

		if (usersProvisionedEnabled) {
			const deleteCellIndex = cells.findIndex(({ type }) => type === CELL_TYPES.ICON_BUTTON);
			// @ts-ignore
			cells[deleteCellIndex] = { ...cells[deleteCellIndex], disabled: true };
		}

		if (isPending) {
			const content = `Loading "${selectedTeamspace}" users data...`;
			return (
				<LoaderContainer>
					<Loader content={content} />
				</LoaderContainer>
			);
		}

		if (!this.props.isTeamspaceAdmin) {
			return null;
		}

		const {licencesCount, limit, users } = this.props;
		const limitReached =  (limit || 0) as number <= users.length;

		return (
			<>
				<UserManagementTab footerLabel={
					<AssignedLicenses licencesCount={licencesCount} limit={limit} usersCount={users.length} >
						<PendingInvites {...this.props} onInvitationOpen={this.handleInvitationOpen} limitReached={limitReached} />
					</AssignedLicenses>} className={this.props.className}>
					<CustomTable cells={cells} rows={rows} />
				</UserManagementTab>
				{containerElement && this.renderNewUserForm(containerElement)}
			</>
		);
	}
}
