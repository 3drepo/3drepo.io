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
import { matches, cond, orderBy, pick, values, stubTrue, first, isEqual, omit } from 'lodash';
import SimpleBar from 'simplebar-react';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import Checkbox from '@material-ui/core/Checkbox';

import { SORT_ORDER_TYPES } from '../../../constants/sorting';
import { sortByName, sortByJob } from '../../../helpers/sorting';
import { JobItem } from '../jobItem/jobItem.component';
import { UserItem } from '../userItem/userItem.component';
import { Highlight } from '../highlight/highlight.component';
import { ColorPicker } from '../colorPicker/colorPicker.component';

import { CellUserSearch } from './components/cellUserSearch/cellUserSearch.component';
import { CellSelect } from './components/cellSelect/cellSelect.component';
import { Container, Head, Row, SortLabel, Cell, CheckboxCell } from './customTable.styles';

export const TableHeading = ({cell, sortBy, order, onClick, onChange, hideSortIcon}) => {
	if (!cell.name) {
		return (<></>);
	}

	if (hideSortIcon) {
		return (<>{cell.name}</>);
	}

	return (
		<SortLabel
			active={sortBy === cell.type}
			direction={sortBy === cell.type ? order : SORT_ORDER_TYPES.ASCENDING}
			onClick={onClick}
		>
			{cell.name}
		</SortLabel>
	);
};

export const TableButton = ({icon, onClick, disabled}) => {
	return (
		<IconButton onClick={onClick} disabled={disabled}>
			<Icon>{icon}</Icon>
		</IconButton>
	);
};

const CheckboxField = (props) => {
	return (
		<Checkbox
			{...props}
			color="secondary"
		/>
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
	[CELL_TYPES.ICON_BUTTON]: TableButton,
	[CELL_TYPES.COLOR]: ColorPicker
};

const CELL_DEFAULT_PROPS = {
	[CELL_TYPES.EMPTY]: {
		flex: 100
	},
	[CELL_TYPES.JOB]: {
		itemTemplate: JobItem,
		flex: 25
	},
	[CELL_TYPES.NAME]: {
		flex: 30
	},
	[CELL_TYPES.USER]: {
		flex: 25
	},
	[CELL_TYPES.PERMISSIONS]: {
		flex: 25
	},
	[CELL_TYPES.ICON_BUTTON]: {
		width: '83px'
	},
	[CELL_TYPES.CHECKBOX]: {
		width: '50px'
	}
};

export const TABLE_DATA_TYPES = {
	USER: 1,
	JOB: 2,
	COLOR: 3,
	RADIO_BUTTON: 4,
	CHECKBOX: 5,
	PERMISSIONS: 6,
	ICON_BUTTON: 7,
	EMPTY: 8,
	NAME: 9,
	DEFAULT: 10
};

/**
 * Return list of sorted items
 * @param members
 * @param options
 * @returns {Array}
 */
const getSortedRows = (rows, type, order) => {
	const { USER, JOB, PERMISSIONS, NAME } = CELL_TYPES;
	const sort = cond([
		[matches({ type: USER }), sortByName.bind(null, rows)],
		[matches({ type: NAME }), sortByName.bind(null, rows)],
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
	onSelectionChange?: (selectedRows) => void;
	defaultSort?: number;
}

interface IState {
	sortBy: number;
	order: string;
	processedRows: any;
	searchFields: any;
	searchText: string;
	selectedRows: any[];
}

export class CustomTable extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps(nextProps, prevState) {
		const searchFields = getSearchFields(nextProps.cells);
		const {sortBy, order, searchText} = prevState;
		const initialSortBy = nextProps.defaultSort || (first(nextProps.cells) || {type: CELL_TYPES.NAME} as any).type;
		const newSortBy = !prevState.processedRows.length ? initialSortBy : sortBy;

		return {
			searchFields,
			sortBy: newSortBy
		};
	}

	public state = {
		sortBy: CELL_TYPES.USER,
		order: SORT_ORDER_TYPES.ASCENDING,
		processedRows: [],
		searchFields: {},
		searchText: '',
		selectedRows: []
	};

	public componentDidUpdate(prevProps, prevState) {
		const stateChanges = {};

		const isInitialProccessing = !this.state.processedRows.length && this.props.rows.length;
		const rowsChanged = prevProps.rows.length !== this.props.rows.length || !isEqual(this.props.rows, prevProps.rows);
		const sortChanged = prevState.sortBy !== this.state.sortBy;

		if (rowsChanged || sortChanged) {
			const {sortBy, order, searchFields, searchText} = this.state;
			this.setState({
				processedRows: getProcessedRows({
					rows: this.props.rows,
					sortBy,
					order,
					searchFields,
					searchText
				})
			});
		}
	}

	public createSortHandler = (sortBy) => () => {
		let order = SORT_ORDER_TYPES.ASCENDING;

		if (this.state.order === order && this.state.sortBy === sortBy) {
			order = SORT_ORDER_TYPES.DESCENDING;
		}

		if (this.state.sortBy !== sortBy) {
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

	public handleSelectionChange = (row) => (event, checked) => {
		const selectedRows = [...this.state.selectedRows]
			.filter((selectedRow) => !isEqual(omit(selectedRow, 'selected'), omit(row, 'selected')));

		if (checked) {
			selectedRows.push(row);
		}

		this.setState({selectedRows}, () => {
			this.props.onSelectionChange(selectedRows);
		});
	}

	public handleSelectAll = (event, checked) => {
		const selectedRows = checked ? [...this.state.processedRows] : [];
		this.setState({selectedRows}, () => {
			this.props.onSelectionChange(selectedRows);
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
				{Component}
			</Tooltip>
		);

		return cells.map((cell, index) => {
			const type = cell.headerType || cell.type;
			const BasicHeadingComponent = cell.HeadingComponent || TableHeading;
			const cellData = {
				...(CELL_DEFAULT_PROPS[type] || {}),
				...cell
			};

			const HeadingComponent = <BasicHeadingComponent
				cell={cellData}
				sortBy={sortBy}
				order={order}
				onClick={this.createSortHandler(type)}
				onChange={this.createSearchHandler()}
				hideSortIcon={cellData.hideSortIcon}
			/>;

			return (
				<Cell key={index} {...cellData}>
					{
						cellData.tooltipText ?
							setTooltip(HeadingComponent, cellData.tooltipText) :
							HeadingComponent
					}
				</Cell>
			);
		});
	}

	/**
	 * Renders row for each user
	 */
	public renderRows = (cells = [], data = [], showCheckbox) => {
		return data.map((row, index) => {
			return (
				<Row key={index}>
					{
						showCheckbox ? (
							<CheckboxCell {...CELL_DEFAULT_PROPS[CELL_TYPES.CHECKBOX]}>
								<CheckboxField
									onChange={this.handleSelectionChange(row)}
									checked={row.selected}
								/>
							</CheckboxCell>
						) : null
					}
					{
						row.data.map((cellData, cellIndex) => {
							const cellConfig = cells[cellIndex];
							const type = cellConfig.type;
							const CellComponent = cellConfig.CellComponent;
							const cellProps = CELL_DEFAULT_PROPS[type];

							return (
								<Cell key={cellIndex} {...cellProps}>
									{
										CellComponent ?
											(<CellComponent {...cellData} searchText={this.state.searchText} />) :
											(<Highlight text={cellData.value} search={this.state.searchText} />)
									}
								</Cell>
							);
						})
					}
				</Row>
			);
		});
	}

	public render() {
		const { cells, onSelectionChange, rows } = this.props;
		const { processedRows } = this.state;
		const showCheckbox = Boolean(onSelectionChange);

		const numberOfSelectedRows = processedRows.filter(({selected}) => selected).length;
		const selectedAll = numberOfSelectedRows && numberOfSelectedRows === rows.length;
		const isIndeterminate = Boolean(numberOfSelectedRows && !selectedAll);

		return (
			<Container>
				<Head>
					{
						showCheckbox ? (
							<CheckboxCell {...CELL_DEFAULT_PROPS[CELL_TYPES.CHECKBOX]}>
								<CheckboxField
									onChange={this.handleSelectAll}
									indeterminate={isIndeterminate}
									checked={selectedAll || isIndeterminate}
								/>
							</CheckboxCell>
						) : null
					}
					{this.renderHeader(cells)}
				</Head>
				<SimpleBar>
					{this.renderRows(cells, processedRows, showCheckbox)}
				</SimpleBar>
			</Container>
		);
	}
}
