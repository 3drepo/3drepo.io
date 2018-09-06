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
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

import { Container } from './usersList.styles';
import { CustomTableHeader } from '../customTableHeader/customTableHeader.component';

interface IProps {
	noop: string; // TODO: Remove sample
	members: any[];
	jobs: any[];
	currentTeamspace: string;
	onChange: void;
}

interface IState {
	cells: any[];
	rows: any[];
}

export class UsersList extends React.PureComponent<IProps, IState> {
	public state = {
		cells: ["one", "two"],
		rows: [{data: ["1", "2"]}, {data: ["1", "2"]}, {data: ["1", "2"]}]
	};

	/**
	 * Renders row for each user
	 */
	public renderRows = (rows) => {
		return rows.map((row, index) => {
			return (
				<TableRow key={index}>
					{row.data.map((data, index) => {
						return <TableCell key={index}>{data}</TableCell>;
					})}
				</TableRow>
			);
		});
	}

	public render() {
		const { cells, rows } = this.state;

		return (
			<Container>
				<Table aria-labelledby="Users list">
					<CustomTableHeader
						cells={cells}
					/>
					<TableBody>
						{this.renderRows(rows)}
					</TableBody>
				</Table>
			</Container>
		);
	}
}
