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
import * as ReactDOM from 'react-dom';
import { pick, get, values, isNumber } from 'lodash';
import { MuiThemeProvider } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';

import { theme } from '../../styles';
import { TEAMSPACE_PERMISSIONS } from '../../constants/teamspace-permissions';
import { CustomTable, CELL_TYPES } from '../components/customTable/customTable.component';
import { FloatingActionPanel } from '../components/floatingActionPanel/floatingActionPanel.component';
import { NewUserForm } from '../components/newUserForm/newUserForm.component';

import { Container, Content, Footer, FloatingButton } from './users.styles';

const USERS_TABLE_CELLS = [{
	name: 'User',
	type: CELL_TYPES.USER,
	searchBy: ['firstName', 'lastName', 'user', 'company']
}, {
	name: 'Job',
	type: CELL_TYPES.JOB
}, {
	name: 'Permissions',
	type: CELL_TYPES.PERMISSIONS
}, {
	type: CELL_TYPES.EMPTY
}, {
	type: CELL_TYPES.ICON_BUTTON
}];

interface IProps {
	currentTeamspace: string;
	users: any[];
	limit: any;
	jobs: any[];
	active?: boolean;
	addUser: (user) => void;
	removeUser: (username) => void;
}

interface IState {
	rows: any[];
	jobs: any[];
	licencesLabel: string;
	containerElement: Element;
	active: boolean;
}

const teamspacePermissions = values(TEAMSPACE_PERMISSIONS)
	.map(({label: name, isAdmin: value }: {label: string, isAdmin: boolean}) => ({ name, value }));

export class Users extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
		if (nextProps.active !== prevState.active) {
			return {active: nextProps.active};
		}

		return {
			rows: nextProps.users,
			jobs: nextProps.jobs.map(({_id: name, color}) => ({name, color, value: name}))
		};
	}

	public state = {
		rows: [],
		jobs: [],
		licencesLabel: '',
		containerElement: null,
		active: true
	};

	public componentDidMount() {
		const containerElement = (ReactDOM.findDOMNode(this) as HTMLElement).closest('md-content');
		this.setState({ containerElement });
	}

	public onUserChange = (user, updatedValue) => {
		console.log("User changed!", updatedValue);
	}

	public onRemove = (username) => {
		this.props.removeUser(username);
	}

	public onSave = ({name, job, isAdmin = false}) => {
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
					onChange: this.onUserChange.bind(null, user)
				},
				{
					value: user.isAdmin,
					items: teamspacePermissions,
					onChange: this.onUserChange.bind(null, user),
					isDisabled: user.isCurrentUser || user.isOwner
				},
				{},
				{
					icon: 'remove_circle',
					onClick: this.onRemove.bind(null, user.user)
				}
			];
			return { ...user, data };
		});
	}

	public renderNewUserForm = (container) => {
		const formProps = {
			jobs: this.state.jobs,
			onSave: this.onSave
		};
		const panel = (
			<FloatingActionPanel
				open={this.state.active}
				render={({closePanel}) => {
					return <NewUserForm {...formProps} onCancel={closePanel} />;
				}}
			/>
		);
		return ReactDOM.createPortal(
			panel,
			container
		);
	}

	/**
	 * Generate licences summary
	 */
	public renderFooter = () => {
		const limit = isNumber(this.props.limit) ? this.props.limit : "unlimited";
		const content = `Assigned licences: ${ this.props.users.length } out of ${ limit }`;
		return <Footer item>{content}</Footer>;
	}

	public render() {
		const { rows, jobs, licencesLabel, containerElement, active } = this.state;

		const preparedRows = this.getUsersTableRows(rows, jobs);
		return (
			<MuiThemeProvider theme={theme}>
				<>
					<Container
						container
						direction="column"
						alignItems="stretch"
						wrap="nowrap"
					>
						<Content item>
							<CustomTable
								cells={USERS_TABLE_CELLS}
								rows={preparedRows}
							/>
						</Content>
						{rows && this.renderFooter()}
					</Container>
					{active && containerElement && this.renderNewUserForm(containerElement)}
				</>
			</MuiThemeProvider>
		);
	}
}
