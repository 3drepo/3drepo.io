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
import { pick, get} from 'lodash';

import { Container } from './users.styles';

import { CustomTable, CELL_TYPES } from '../components/customTable/customTable.component';
import { TEAMSPACE_PERMISSIONS } from '../../constants/teamspace-permissions';
import { values } from 'lodash';

const USERS_TABLE_CELLS = [{
	name: 'User',
	type: CELL_TYPES.USER,
	allowSearch: true
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
	users: any[];
	jobs: any[];
	onUsersChange: void;
}

interface IState {
	rows: any[];
	jobs: any[];
	licencesLabel: string;
}

const teamspacePermissions = values(TEAMSPACE_PERMISSIONS)
	.map(({label: name, isAdmin: value }: {label: string, isAdmin: boolean}) => ({ name, value }));

export class Users extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps(nextProps: IProps) {
		return {
			rows: nextProps.users,
			jobs: nextProps.jobs.map(({_id: name, color}) => ({name, color, value: name}))
		};
	}

	public state = {
		rows: [],
		jobs: [],
		licencesLabel: ''
	};

	public onUserChange = (user, updatedValue) => {
		console.log("User changed!", updatedValue);
	}

	public onRemove = () => {
		console.log("User removed!");
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
					onClick: this.onRemove.bind(null, user)
				}
			];
			return { ...user, data };
		});
	}

	public render() {
		const { rows, jobs, licencesLabel } = this.state;

		const preparedRows = this.getUsersTableRows(rows, jobs);
		return (
			<Container>
				<CustomTable
					cells={USERS_TABLE_CELLS}
					rows={preparedRows}
				/>
				<div>{ licencesLabel }</div>
			</Container>
		);
	}
}
