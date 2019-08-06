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
	isEmpty,
	isEqual,
	isNumber,
	matches,
	pick,
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
import { JobItem } from '../components/jobItem/jobItem.component';
import { NewUserForm } from '../components/newUserForm/newUserForm.component';
import { UserItem } from '../components/userItem/userItem.component';
import { UserManagementTab } from '../components/userManagementTab/userManagementTab.component';

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
	limit: any;
	jobs: any[];
	addUser: (user) => void;
	removeUser: (username) => void;
	updateJob: (username, job) => void;
	updatePermissions: (permissions) => void;
	onUsersSearch: (searchText) => void;
	clearUsersSuggestions: () => void;
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
		[matches('job'), () => this.props.updateJob(user.user, value)],
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
		const containerElement = (ReactDOM.findDOMNode(this) as HTMLElement)
			.parentNode;
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

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public renderNewUserFormPanel = ({ closePanel }) => {
		const { limit } = this.state;
		const { users, usersSuggestions, clearUsersSuggestions, onUsersSearch } = this.props;

		const formProps = {
			title: this.getFooterLabel(users, limit),
			jobs: this.state.jobs,
			users: usersSuggestions,
			onSave: this.onSave,
			clearSuggestions: clearUsersSuggestions,
			getUsersSuggestions: onUsersSearch
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

	/**
	 * Generate licences summary
	 */
	public getFooterLabel = (users = [], limit = 0) => {
		if (!users) {
			return '';
		}

		const limitValue = isNumber(limit) ? limit : 'unlimited';
		return `Assigned licences: ${users.length} out of ${limitValue}`;
	}

	public render() {
		const { rows, containerElement, limit } = this.state;
		const { users } = this.props;

		return (
			<>
				<UserManagementTab footerLabel={this.getFooterLabel(users, limit)}>
					<CustomTable cells={USERS_TABLE_CELLS} rows={rows} />
				</UserManagementTab>
				{containerElement && this.renderNewUserForm(containerElement)}
			</>
		);
	}
}
