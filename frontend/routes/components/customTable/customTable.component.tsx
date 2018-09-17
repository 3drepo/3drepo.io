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
import { matches, cond, orderBy, pick, values, stubTrue } from 'lodash';
import SimpleBar from 'simplebar-react';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';

import { SORT_ORDER_TYPES } from '../../../constants/sorting';
import { SORT_TYPES } from '../../../constants/sorting';
import { sortByName, sortByJob } from '../../../helpers/sorting';
import { JobItem } from '../jobItem/jobItem.component';
import { UserItem } from '../userItem/userItem.component';
import { Highlight } from '../highlight/highlight.component';

import { CellUserSearch } from './components/cellUserSearch/cellUserSearch.component';
import { CellSelect } from './components/cellSelect/cellSelect.component';
import { Container, Head, Row, SortLabel, Cell } from './customTable.styles';

const HeaderCell = ({cell, sortBy, order, onClick, onChange}) => {
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

const RowCellButton = ({icon, onClick, disabled}) => {
	return (
		<IconButton onClick={onClick} disabled={disabled}>
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
	EMPTY: 8,
	NAME: 9
};

const HEADER_CELL_COMPONENTS = {
	[CELL_TYPES.USER]: CellUserSearch,
	[CELL_TYPES.NAME]: CellUserSearch
};

const ROW_CELL_COMPONENTS = {
	[CELL_TYPES.USER]: UserItem,
	[CELL_TYPES.JOB]: CellSelect,
	[CELL_TYPES.PERMISSIONS]: CellSelect,
	[CELL_TYPES.ICON_BUTTON]: RowCellButton
};

const ROW_CELL_DEFAULT_PROPS = {
	[CELL_TYPES.EMPTY]: {
		flex: 100
	},
	[CELL_TYPES.JOB]: {
		itemTemplate: JobItem,
		flex: 25
	},
	[CELL_TYPES.NAME]: {
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
const getSortedRows = (rows, type, order) => {
	const { USER, JOB, PERMISSIONS } = CELL_TYPES;
	const sort = cond([
		[matches({ type: USER }), sortByName.bind(null, rows)],
		[matches({ type: JOB }), sortByJob.bind(null, rows)],
		[matches({ type: PERMISSIONS }), (options) => {
			return orderBy(rows, ['isAdmin'], options.order);
		}],

		// Default action
		[stubTrue, (options) => {
			return orderBy(rows, ['value'], options.order);
		}]
	]);

	return sort({type, order});
};

/**
 * Filter rows by search text
 * @param row
 * @param searchFields
 * @param searchText
 * @returns {Array}
 */
const getFilteredRows = (rows = [], searchFields, searchText): object[] => {
	if (!searchText) {
		return rows;
	}

	const lowerCasedSearchText = searchText.toLowerCase();
	return rows.filter((row) => {
		const requiredFields = pick(row, searchFields);
		return values(requiredFields).join(' ').toLowerCase()
			.includes(lowerCasedSearchText);
	});
};

const getProcessedRows = ({rows, sortBy, order, searchFields, searchText}) => {
	const filteredRows = getFilteredRows(rows, searchFields, searchText);
	return getSortedRows(filteredRows, sortBy, order);
};

const getSearchFields = (cells) => {
	const searchFields = cells.find(({searchBy}) => searchBy);

	return searchFields ? searchFields.searchBy : [];
};

interface IProps {
	cells: any[];
	rows: any[];
}

interface IState {
	sortBy: number;
	order: string;
	processedRows: any;
	searchFields: any;
	searchText: string;
}

export class CustomTable extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps(nextProps, prevState) {
		const searchFields = getSearchFields(nextProps.cells);
		const {sortBy, order, searchText} = prevState;
		return {
			searchFields,
			processedRows: getProcessedRows({
				rows: nextProps.rows,
				sortBy,
				order,
				searchFields,
				searchText
			})
		};
	}

	public state = {
		sortBy: CELL_TYPES.USER,
		order: SORT_ORDER_TYPES.ASCENDING,
		processedRows: [],
		searchFields: {},
		searchText: ''
	};

	public createSortHandler = (sortBy, searchBy = []) => () => {
		let order = SORT_ORDER_TYPES.ASCENDING;

		if (this.state.order === order && this.state.sortBy === sortBy) {
			order = SORT_ORDER_TYPES.DESCENDING;
		}

		const {searchFields, searchText} = this.state;

		this.setState({
			processedRows: getProcessedRows({
				rows: this.props.rows,
				sortBy,
				order,
				searchFields,
				searchText
			}),
			sortBy,
			order
		});
	}

	public createSearchHandler = () => (searchText) => {
		const {sortBy, order, searchFields} = this.state;
		const processedRows = getProcessedRows({
			rows: this.props.rows,
			sortBy,
			order,
			searchFields,
			searchText
		});
		this.setState({processedRows, searchText});
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
			const CellComponent = HEADER_CELL_COMPONENTS[cell.type] || HeaderCell;
			const cellData = {
				...(ROW_CELL_DEFAULT_PROPS[cell.type] || {}),
				...cell
			};

			return (
				<Cell key={index} {...cellData}>
					{cellData.tooltipText ? setTooltip(CellComponent, cellData.tooltipText) : (
						<CellComponent
							cell={cellData}
							sortBy={sortBy}
							order={order}
							onClick={this.createSortHandler(cell.type)}
							onChange={this.createSearchHandler()}
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
						const cellProps = ROW_CELL_DEFAULT_PROPS[type];

						return (
							<Cell key={cellIndex} {...cellProps}>
								{
									CellComponent ?
										(<CellComponent {...data} searchText={this.state.searchText} />) :
										(<Highlight text={data.value} search={this.state.searchText} />)
								}
							</Cell>
						);
					})}
				</Row>
			);
		});
	}

	public renderThumb = ({ style, ...props }) => {
		const thumbStyle = {
			backgroundColor: `red`
		};
		return (
			<div style={{ ...style, ...thumbStyle }} {...props} />
		);
	}

	public render() {
		const { cells } = this.props;
		const { processedRows } = this.state;

		return (
			<Container>
				<Head>{this.renderHeader(cells)}</Head>
				<SimpleBar>
					{this.renderRows(processedRows, cells)}
				</SimpleBar>
			</Container>
		);
	}
}
