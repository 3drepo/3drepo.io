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
import { pick } from 'lodash';

import { Container } from './users.styles';

import { CustomTable, CELL_TYPES } from '../components/customTable/customTable.component';

const USERS_TABLE_CELLS = [{
	name: 'Users',
	type: CELL_TYPES.USER
}, {
	name: 'Jobs',
	type: CELL_TYPES.JOB
}, {
	name: 'Permissions',
	type: CELL_TYPES.SELECT
}, {}];

interface IProps {
	users: any[];
	jobs: any[];
	onUsersChange: void;
}

interface IState {
	rows: any[];
	jobs: any[];
}

export class Users extends React.PureComponent<IProps, IState> {
	public static state = {
		rows: [],
		jobs: []
	};

	public static getDerivedStateFromProps(nextProps: IProps) {
		return {
			rows: nextProps.users,
			jobs: nextProps.jobs
		};
	}

	public onJobChange = (user, updatedValue) => {
		console.log("User jobchanged!", updatedValue);
	}

	public onPermissionsChange = () => {
		console.log("User permissions changed!");
	}

	public onRemove = () => {
		console.log("User removed!");
	}

	public getUsersTableRows = (users = [], jobs = []): any[] => {
		return users.map((user) => {
			const data = [
				pick(user, ['firstName', 'lastName', 'company', 'user']),
				{ name: user.job, jobs, onChange: this.onJobChange.bind(null, user) },
				{ permission: user.permissions, onChange: this.onPermissionsChange.bind(null, user) },
				{ id: user.user, onClick: this.onRemove.bind(null, user) }
			];
			return { ...user, data };
		});
	}

	public render() {
		const { rows, jobs } = this.state;

		const preparedRows = this.getUsersTableRows(rows, jobs);
		return (
			<Container>
				<CustomTable
					cells={USERS_TABLE_CELLS}
					rows={preparedRows}
				/>
			</Container>
		);
	}
}
