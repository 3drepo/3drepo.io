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
import {
	matchesProperty, cond, orderBy, pick, values,
	stubTrue, first, isEqual, identity, isEmpty, omit
} from 'lodash';
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
import { TableHeading } from './components/tableHeading/tableHeading.component';
import { CellSelect } from './components/cellSelect/cellSelect.component';

import { Container, Head, BodyWrapper, Body, Row, Cell, CheckboxCell } from './customTable.styles';

export const TableButton = ({icon, onClick, disabled}) => {
	return (
		<IconButton onClick={onClick} disabled={disabled}>
			<Icon>{icon}</Icon>
		</IconButton>
	);
};

export const CheckboxField = (props) => {
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

const EQUALITY_CHECK_FIELDS = ['id', '_id', 'name', 'user', 'model'];

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
const getSortedRows = (rows, type, column, order) => {
	const { USER, JOB, NAME } = CELL_TYPES;
	const sort = cond([
		[matchesProperty('type', USER), sortByName.bind(null, rows)],
		[matchesProperty('type', NAME), sortByName.bind(null, rows)],
		[matchesProperty('type', JOB), sortByJob.bind(null, rows)],

		// Default action
		[stubTrue, (options) => {
			return orderBy(rows, ({data}) => data[options.column].value || null, options.order);
		}]
	]);

	return sort({type, order, column});
};

/**
 * Filter rows by search text
 * @param row
 * @param searchFields
 * @param searchText
 * @returns {Array}
 */
const getFilteredRows = ({rows = [], searchFields, searchText}): object[] => {
	if (!searchText) {
		return rows;
	}

	return rows.filter((row) => {
		const requiredFields = pick(row, searchFields);
		return values(requiredFields).join(' ').toLowerCase()
			.includes(searchText);
	});
};

const getProcessedRows = ({rows = [], sortBy, sortColumn, order, searchFields, searchText, onSearch}) => {
	if (!rows.length) {
		return [];
	}
	const filteredRows = (onSearch || getFilteredRows)({
		rows,
		searchFields,
		searchText: searchText.toLowerCase()
	});
	return getSortedRows(filteredRows, sortBy, sortColumn, order);
};

const updateProcessedRows = ({updatedRows = [], processedRows = []}) => {
	return processedRows.map((processedRow) => {
		const row = updatedRows.find((updatedRow) => {
			return isEqual(
				pick(updatedRow, EQUALITY_CHECK_FIELDS),
				pick(processedRow, EQUALITY_CHECK_FIELDS)
			);
		});

		return row || processedRow;
	});
};

const getSearchFields = (cells) => {
	const searchFields = cells.find(({searchBy}) => searchBy);
	return searchFields ? searchFields.searchBy : [];
};

const FIELDS_TO_OMIT = ['selected', 'data', 'disabled'];

interface IProps {
	cells: any[];
	rows: any[];
	defaultSort?: number;
	onSelectionChange?: (selectedRows) => void;
	renderCheckbox?: (props, data) => React.ReactChild;
	onSearch?: (props) => any[];
}

interface IState {
	currentSort: {
		activeIndex: number;
		type?: number;
		order: string;
	};
	processedRows: any;
	searchFields: any;
	searchText: string;
	selectedRows: any[];
}

export class CustomTable extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps(nextProps, prevState) {
		const searchFields = getSearchFields(nextProps.cells);
		return {searchFields};
	}

	public state = {
		currentSort: {
			activeIndex: 0,
			type: null,
			order: SORT_ORDER_TYPES.ASCENDING
		},
		processedRows: [],
		searchFields: {},
		searchText: '',
		selectedRows: []
	};

	private rowsContainerRef = React.createRef<HTMLElement>();

	public componentDidMount() {
		const { currentSort, searchFields, searchText } = this.state;
		const initialSortType = (this.props.cells[0] || {}).type;

		this.setState({
			currentSort: {
				...this.state.currentSort,
				type: initialSortType
			},
			processedRows: getProcessedRows({
				rows: this.props.rows,
				sortBy: initialSortType,
				sortColumn: currentSort.activeIndex,
				order: currentSort.order,
				searchFields,
				searchText,
				onSearch: this.props.onSearch
			})
		});
	}

	public componentDidUpdate(prevProps, prevState) {
		const changes = {} as any;
		const areNotSameRows = !isEqual(this.props.rows, prevProps.rows);
		const rowsChanged = prevProps.rows.length !== this.props.rows.length || areNotSameRows;
		const rowsValuesChanged = this.props.rows.length &&
			prevProps.rows.length === this.props.rows.length && areNotSameRows;

		const sortChanged = prevState.currentSort.type !== this.state.currentSort.type;
		const orderChanged = prevState.currentSort.order !== this.state.currentSort.order;

		if (rowsValuesChanged && !sortChanged && !orderChanged) {
			changes.processedRows = updateProcessedRows({
				updatedRows: this.props.rows,
				processedRows: prevState.processedRows
			});
		} else if (rowsChanged || sortChanged || orderChanged) {
			const {currentSort, searchFields, searchText} = this.state;
			changes.processedRows = getProcessedRows({
				rows: this.props.rows,
				sortBy: currentSort.type,
				sortColumn: currentSort.activeIndex,
				order: currentSort.order,
				searchFields,
				searchText,
				onSearch: this.props.onSearch
			});
		}

		if (areNotSameRows) {
			changes.selectedRows = changes.processedRows.reduce((selectedRows, row) => {
				if (row.selected) {
					selectedRows.push(row);
				}
				return selectedRows;
			}, []);
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public createSortHandler = (activeSortIndex, type) => () => {
		const {currentSort} = this.state;
		let order = SORT_ORDER_TYPES.ASCENDING;

		if (currentSort.order === order && currentSort.type === type) {
			order = SORT_ORDER_TYPES.DESCENDING;
		}

		if (currentSort.type !== type) {
			order = SORT_ORDER_TYPES.DESCENDING;
		}

		const {searchFields, searchText} = this.state;
		this.setState({
			processedRows: getProcessedRows({
				rows: this.props.rows,
				sortBy: type,
				sortColumn: activeSortIndex,
				order,
				searchFields,
				searchText,
				onSearch: this.props.onSearch
			}),
			currentSort: {
				activeIndex: activeSortIndex,
				order,
				type
			}
		});
	}

	public createSearchHandler = () => (searchText) => {
		const {currentSort, searchFields} = this.state;
		const processedRows = getProcessedRows({
			rows: this.props.rows,
			sortBy: currentSort.type,
			sortColumn: currentSort.activeIndex,
			order: currentSort.order,
			searchFields,
			searchText,
			onSearch: this.props.onSearch
		});
		this.setState({processedRows, searchText});
	}

	public handleSelectionChange = (row) => (event, checked) => {
		const preparedRow = pick(row, EQUALITY_CHECK_FIELDS);

		const selectedRows = [...this.state.selectedRows]
			.filter((selectedRow) => !isEqual(pick(selectedRow, EQUALITY_CHECK_FIELDS), preparedRow));

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

	public handleSelectByRowClick = (row: any) => (event) => {
		if (this.props.onSelectionChange && !row.disabled && event.target.tagName !== 'INPUT') {
			this.handleSelectionChange(row)(event, !row.selected);
		}
	}

	/**
	 * Renders row for each user
	 */
	public renderHeader = (cells) => {
		const {currentSort} = this.state;
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

			const {root = {}, component = {}} = cell.HeadingProps || {};

			const headingRootProps = {
				...CELL_DEFAULT_PROPS[type],
				...root
			};

			const hasActiveSort = currentSort.activeIndex === index;
			const headingComponentProps = {
				onChange: this.createSearchHandler(),
				onClick: this.createSortHandler(index, cell.type),
				activeSort: hasActiveSort,
				sortOrder: hasActiveSort ? currentSort.order : SORT_ORDER_TYPES.ASCENDING,
				label: cell.name,
				...component
			};

			const HeadingComponent = <BasicHeadingComponent {...headingComponentProps} />;

			return (
				<Cell key={index} {...headingRootProps}>
					{
						headingComponentProps.tooltipText ?
							setTooltip(HeadingComponent, headingComponentProps.tooltipText) :
							HeadingComponent
					}
				</Cell>
			);
		});
	}

	public renderCheckbox({row = {}, ...props}): React.ReactChild {
		if (this.props.renderCheckbox) {
			return this.props.renderCheckbox(props, row);
		}

		return <CheckboxField {...props} />;
	}

	/**
	 * Renders row for each user
	 */
	public renderRows = (cells = [], data = [], showCheckbox) => {
		return data.map((row, index) => {
			const rowProps = {key: index, clickable: showCheckbox && !row.disabled};

			return (
				<Row {...rowProps}>
					{
						showCheckbox ? (
							<CheckboxCell {...CELL_DEFAULT_PROPS[CELL_TYPES.CHECKBOX]}>
								{
									this.renderCheckbox({
										onChange: this.handleSelectionChange(row),
										checked: row.selected,
										row
									})
								}
							</CheckboxCell>
						) : null
					}
					{
						row.data.map((cellData, cellIndex) => {
							const {CellProps = {}, CellComponent, type} = (cells[cellIndex] || {}) as any;
							const {root = {}, component = {}} = CellProps;

							const cellRootProps = {
								...CELL_DEFAULT_PROPS[type],
								...root
							};

							const cellComponentProps = {
								...cellData,
								...component,
								searchText: this.state.searchText
							};
							
							return (
								<Cell key={cellIndex} {...cellRootProps} onClick={this.handleSelectByRowClick(row)}>
									{
										CellComponent ?
											(<CellComponent {...cellComponentProps} />) :
											(<Highlight text={cellComponentProps.value} search={cellComponentProps.searchText} />)
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
								{
									this.renderCheckbox({
										onChange: this.handleSelectAll,
										indeterminate: isIndeterminate,
										checked: selectedAll || isIndeterminate
									})
								}
							</CheckboxCell>
						) : null
					}
					{this.renderHeader(cells)}
				</Head>
				<BodyWrapper>
					<Body innerRef={this.rowsContainerRef}>
						<SimpleBar data-simplebar-x-hidden>
							{this.renderRows(cells, processedRows, showCheckbox)}
						</SimpleBar>
					</Body>
				</BodyWrapper>
			</Container>
		);
	}
}
