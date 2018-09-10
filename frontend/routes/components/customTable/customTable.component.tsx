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
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';

import { Container, Row } from './customTable.styles';
import { CellUser } from './components/cellUser/cellUser.component';
import { CellJob } from './components/cellJob/cellJob.component';

interface IProps {
	cells: any[];
	rows: any[];
	onChange: any;
}

export const CELL_TYPES = {
	USER: 1,
	JOB: 2,
	SELECT: 3,
	COLOR: 4,
	RADIO_BUTTON: 5,
	CHECKBOX: 6
};

const HEADER_CELL_COMPONENTS = {
	//[CELL_TYPES.USER]: 
};

const ROW_CELL_COMPONENTS = {
	[CELL_TYPES.USER]: CellUser,
	[CELL_TYPES.JOB]: CellJob
};

export class CustomTable extends React.PureComponent<IProps, any> {
	/**
	 * Renders row for each user
	 */
	public renderHeader = (cells) => {
		return cells.map((cell, index) => {
			return <TableCell key={index}>{cell.name}</TableCell>;
		});
	}

	/**
	 * Renders row for each user
	 */
	public renderRows = (rows = [], cells = []) => {
		return rows.map((row, index) => {
			return (
				<Row key={index}>
					{row.data.map((data, cellIndex) => {
						const CellComponent = ROW_CELL_COMPONENTS[cells[cellIndex].type];
						return (
							<TableCell key={cellIndex}>
								{
									CellComponent ?
										(<CellComponent data={data} />)
										: Object.keys(data).join(', ')
								}
							</TableCell>
						);
					})}
				</Row>
			);
		});
	}

	public render() {
		const { cells, rows } = this.props;

		return (
			<Container>
				<Table aria-labelledby="Users list">
					<TableHead>
						<Row>{this.renderHeader(cells)}</Row>
					</TableHead>
					<TableBody>
						{this.renderRows(rows, cells)}
					</TableBody>
				</Table>
			</Container>
		);
	}
}
