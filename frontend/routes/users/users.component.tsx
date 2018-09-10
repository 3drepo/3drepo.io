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
}];

const getUsersTableRows = (users = []): any[] => {
	return users.map((user) => {
		const data = [
			pick(user, ['firstName', 'lastName', 'company', 'user']),
			user.job,
			user.permissions
		];
		return {...user, data};
	});
};

interface IProps {
	users: any[];
	jobs: any[];
	onUsersChange: void;
}

interface IState {
	rows: any[];
}

export class Users extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps(nextProps: IProps) {
		const rows = getUsersTableRows(nextProps.users);
		return {
			rows
		};
	}

	constructor(props, context) {
		super(props, context);

		this.state = {
			rows: []
		};
	}

	public onUsersChange = () => {
		console.log("Users changed!");
	}

	public render() {
		const { rows } = this.state;

		return (
			<Container>
				<CustomTable
					cells={USERS_TABLE_CELLS}
					rows={rows}
					onChange={this.onUsersChange}
				/>
			</Container>
		);
	}
}
