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
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';

import { Container, Row } from './customTable.styles';
import { CellUser } from './components/cellUser/cellUser.component';
import { CellSelect } from './components/cellSelect/cellSelect.component';
import { JobItem } from '../jobItem/jobItem.component';

import { SORT_ORDER_TYPES } from '../../../constants/sorting';

export const CELL_TYPES = {
	USER: 1,
	JOB: 2,
	COLOR: 3,
	RADIO_BUTTON: 4,
	CHECKBOX: 5,
	PERMISSIONS: 6
};

const HEADER_CELL_COMPONENTS = {
	// [CELL_TYPES.USER]:
};

const ROW_CELL_COMPONENTS = {
	[CELL_TYPES.USER]: CellUser,
	[CELL_TYPES.JOB]: CellSelect,
	[CELL_TYPES.PERMISSIONS]: CellSelect
};

const ROW_CELL_EXTRA_DATA = {
	[CELL_TYPES.JOB]: {
		itemTemplate: JobItem
	}
};

const HeaderCell = ({cell, orderBy, order}) => (
	<TableSortLabel
		active={orderBy === cell.type}
		direction={order}
		onClick={() => this.sortBy(cell.type)}
	>
		{cell.name}
	</TableSortLabel>
);

interface IProps {
	cells: any[];
	rows: any[];
}

interface IState {
	orderBy: number;
	order: string;
}

export class CustomTable extends React.PureComponent<IProps, IState> {
	public state = {
		orderBy: CELL_TYPES.USER,
		order: SORT_ORDER_TYPES.ASCENDING
	};

	/**
	 * Renders row for each user
	 */
	public renderHeader = (cells) => {
		const { orderBy, order } = this.state;
		const setTooltip = (Component, text) => (
			<Tooltip
				title={text}
				placement="bottom-end"
			>
				<Component />
			</Tooltip>
		);

		return cells.map((cell, index) => {
			return (
				<TableCell key={index}>
					{cell.tooltipText ? setTooltip(HeaderCell, cell.tooltipText) : (
						<HeaderCell
							cell={cell}
							orderBy={orderBy}
							order={order}
						/>
					)}
				</TableCell>
			);
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
						const type = cells[cellIndex].type;
						const CellComponent = ROW_CELL_COMPONENTS[type];
						const cellData = {
							...(ROW_CELL_EXTRA_DATA[type] || {}),
							...data
						};

						return (
							<TableCell key={cellIndex}>
								{
									CellComponent ?
										(<CellComponent {...cellData} />) :
										cellData.value
								}
							</TableCell>
						);
					})}
				</Row>
			);
		});
	}

	public sortBy = (type): void => {
		console.log('sorted!');
	}

	public render() {
		const { cells, rows } = this.props;

		return (
			<Container aria-labelledby="Users list">
				<TableHead>
					<Row>{this.renderHeader(cells)}</Row>
				</TableHead>
				<TableBody>
					{this.renderRows(rows, cells)}
				</TableBody>
			</Container>
		);
	}
}
