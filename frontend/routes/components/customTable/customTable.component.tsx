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
import { matches, cond, orderBy } from 'lodash';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';

import { SORT_ORDER_TYPES } from '../../../constants/sorting';
import { SORT_TYPES } from '../../../constants/sorting';
import { sortByName, sortByJob } from '../../../helpers/sorting';
import { JobItem } from '../jobItem/jobItem.component';

import { CellUser } from './components/cellUser/cellUser.component';
import { CellSelect } from './components/cellSelect/cellSelect.component';
import { Container, Head, Body, Row, SortLabel, Cell } from './customTable.styles';

const HeaderCell = ({cell, sortBy, order, onClick}) => {
	return cell.name ? (
		<SortLabel
			active={sortBy === cell.type}
			direction={sortBy === cell.type ? order : SORT_ORDER_TYPES.ASCENDING}
			onClick={onClick}
		>
			{cell.name}
		</SortLabel>
	) : (<></>);
};

const RowCellButton = ({icon, onClick}) => {
	return (
		<IconButton onClick={onClick}>
			<Icon>{icon}</Icon>
		</IconButton>
	);
};

export const CELL_TYPES = {
	USER: 1,
	JOB: 2,
	COLOR: 3,
	RADIO_BUTTON: 4,
	CHECKBOX: 5,
	PERMISSIONS: 6,
	ICON_BUTTON: 7,
	EMPTY: 8
};

const HEADER_CELL_COMPONENTS = {
	// [CELL_TYPES.USER]:
};

const ROW_CELL_COMPONENTS = {
	[CELL_TYPES.USER]: CellUser,
	[CELL_TYPES.JOB]: CellSelect,
	[CELL_TYPES.PERMISSIONS]: CellSelect,
	[CELL_TYPES.ICON_BUTTON]: RowCellButton
};

const ROW_CELL_EXTRA_DATA = {
	[CELL_TYPES.EMPTY]: {
		flex: 100
	},
	[CELL_TYPES.JOB]: {
		itemTemplate: JobItem,
		flex: 25
	},
	[CELL_TYPES.USER]: {
		flex: 25
	},
	[CELL_TYPES.PERMISSIONS]: {
		flex: 25
	},
	[CELL_TYPES.ICON_BUTTON]: {
		width: '83px'
	}
};

/**
 * Return list of sorted items
 * @param members
 * @param options
 * @returns {Array}
 */
const getSortedRows = (rows, type, order): any[] => {
	const { USER, JOB, PERMISSIONS } = CELL_TYPES;
	const sort = cond([
		[matches({ type: USER }), sortByName.bind(null, rows)],
		[matches({ type: JOB }), sortByJob.bind(null, rows)],
		[matches({ type: PERMISSIONS }), (options) => {
			return orderBy(rows, ["isAdmin"], options.order);
		}]
	]);

	// tslint:disable-next-line
	return sort({type, order});
};

const getFilteredRows = (rows, type, order): any[] => {
	return getSortedRows(rows, type, order);
};

interface IProps {
	cells: any[];
	rows: any[];
}

interface IState {
	sortBy: number;
	order: string;
	filteredRows: any[];
}

export class CustomTable extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps(nextProps, prevState) {
		return {
			filteredRows: getFilteredRows(
				nextProps.rows,
				prevState.sortBy,
				prevState.order
			)
		};
	}

	public state = {
		sortBy: CELL_TYPES.USER,
		order: SORT_ORDER_TYPES.ASCENDING,
		filteredRows: []
	};

	public createSortHandler = (sortBy) => (event) => {
		let order = SORT_ORDER_TYPES.ASCENDING;

		if (this.state.order === order && this.state.sortBy === sortBy) {
			order = SORT_ORDER_TYPES.DESCENDING;
		}

		this.setState({
			filteredRows: getFilteredRows(this.props.rows, sortBy, order),
			sortBy,
			order
		});
	}

	/**
	 * Renders row for each user
	 */
	public renderHeader = (cells) => {
		const { sortBy, order } = this.state;
		const setTooltip = (Component, text) => (
			<Tooltip
				title={text}
				placement="bottom-end"
			>
				<Component />
			</Tooltip>
		);

		return cells.map((cell, index) => {
			const cellData = {
				...(ROW_CELL_EXTRA_DATA[cell.type] || {}),
				...cell
			};

			return (
				<Cell key={index} {...cellData}>
					{cellData.tooltipText ? setTooltip(HeaderCell, cellData.tooltipText) : (
						<HeaderCell
							cell={cellData}
							sortBy={sortBy}
							order={order}
							onClick={this.createSortHandler(cell.type)}
						/>
					)}
				</Cell>
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
							<Cell key={cellIndex} {...cellData}>
								{
									CellComponent ?
										(<CellComponent {...cellData} />) :
										cellData.value
								}
							</Cell>
						);
					})}
				</Row>
			);
		});
	}

	public render() {
		const { cells } = this.props;
		const { filteredRows } = this.state;

		return (
			<Container>
				<Head>{this.renderHeader(cells)}</Head>
				<Body>
					{this.renderRows(filteredRows, cells)}
				</Body>
			</Container>
		);
	}
}
