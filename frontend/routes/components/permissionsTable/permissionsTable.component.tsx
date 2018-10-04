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
import { pick, matches, isEqual, cond, get, isEmpty, memoize } from 'lodash';
import { MuiThemeProvider } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import SimpleBar from 'simplebar-react';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import Tooltip from '@material-ui/core/Tooltip';

// @ts-ignore
import * as AdminIconSrc from '../../../icons/how_to_reg.svg';

import { MODEL_ROLES_TYPES, MODEL_ROLES_LIST } from '../../../constants/model-permissions';
import { CELL_TYPES, CustomTable, CheckboxField } from '../customTable/customTable.component';
import { CellUserSearch } from '../customTable/components/cellUserSearch/cellUserSearch.component';
import { TableHeadingRadio } from '../customTable/components/tableHeadingRadio/tableHeadingRadio.component';
import { UserItem } from '../userItem/userItem.component';
import { TextOverlay } from '../textOverlay/textOverlay.component';

import {
	Container,
	PermissionsCellContainer,
	DisabledCheckbox
} from './permissionsTable.styles';

const PermissionsCell = ({ disabled, checked, onChange }) => {
	return (
		<PermissionsCellContainer>
			<Radio
				checked={checked}
				disabled={disabled}
				onChange={onChange}
			/>
		</PermissionsCellContainer>
	);
};

const getAdminIconText = memoize((isTeamspaceAdmin, isProjectAdmin) => {
	if (isTeamspaceAdmin) {
		return 'Teamspace admin';
	}

	if (isProjectAdmin) {
		return 'Project admin';
	}

	return 'Model admin';
}, (...flags) => flags.join('.'));

const AdminIcon = ({ isTeamspaceAdmin, isProjectAdmin }) => {
	const tooltipTitle = getAdminIconText(isTeamspaceAdmin, isProjectAdmin);
	return (
		<Tooltip title={tooltipTitle}>
			<DisabledCheckbox src={AdminIconSrc} />
		</Tooltip>
	);
};

const UNDEFINED_PERMISSIONS = 'undefined';

const PERMISSIONS_TABLE_CELLS = [{
	name: 'User',
	type: CELL_TYPES.USER,
	HeadingComponent: CellUserSearch,
	HeadingProps: {
		root: {
			width: '180px',
			padding: '0 0 0 24px',
			flex: null
		}
	},
	CellComponent: UserItem,
	CellProps: {
		root: {
			width: '180px',
			padding: '0 0 0 24px',
			flex: null
		}
	},
	searchBy: ['firstName', 'lastName', 'user', 'company']
}];

interface IProps {
	permissions: any[];
	roles: any[];
	onSelectionChange?: (selectedUsers) => void;
	onPermissionsChange?: (permissions) => void;
	rowStateInterceptor?: (props) => void;
}

interface IState {
	rows: any[];
	cells: any[];
	selectedUsers: any[];
	selectedGlobalPermissions: string;
	currentUser: any;
}

export class PermissionsTable extends React.PureComponent<IProps, any> {
	public state = {
		rows: [],
		cells: [],
		selectedUsers: [],
		selectedGlobalPermissions: UNDEFINED_PERMISSIONS,
		currentUser: {}
	};

	public onGlobalPermissionsChange = (event, value) => {
		this.setState({ selectedGlobalPermissions: value });

		if (this.props.onPermissionsChange) {
			const updatedPermissions = this.state.rows
				.reduce((permissionsList, row) => {
					if (row.selected && !row.disabled) {
						permissionsList.push({ ...row, key: value });
					}
					return permissionsList;
				}, []);

			this.props.onPermissionsChange(updatedPermissions);
		}
	}

	public hasDisabledPermissions(row) {
		if (this.props.rowStateInterceptor) {
			return this.props.rowStateInterceptor(row);
		}
		return row.disabled;
	}

	public createPermissionsChangeHandler = (permissions, value) => () => {
		if (this.props.onPermissionsChange) {
			this.props.onPermissionsChange([{
				...permissions,
				key: value
			}]);
		}
	}

	public getTableCells = (roles) => {
		const permissionCellProps = {
			width: '110px',
			flex: null,
			padding: '0'
		};
		const cells = roles.map(({ label: name, tooltip: tooltipText, key: value }) => {
			return {
				name,
				type: CELL_TYPES.RADIO_BUTTON,
				HeadingComponent: TableHeadingRadio,
				HeadingProps: {
					root: permissionCellProps,
					component: {
						name: 'permission',
						tooltipText,
						value,
						onChange: this.onGlobalPermissionsChange,
						checked: this.state.selectedGlobalPermissions === value,
						disabled: !this.state.selectedUsers.length || value === MODEL_ROLES_TYPES.ADMINISTRATOR
					}
				},
				CellComponent: PermissionsCell,
				CellProps: {
					root: permissionCellProps
				}
			};
		});

		return [
			...PERMISSIONS_TABLE_CELLS,
			...cells
		];
	}

	public getTableRows = (permissions = [], roles = [], selectedUsers = []) => {
		return permissions.map((userPermissions) => {
			const disabled = this.hasDisabledPermissions(userPermissions);

			const data = [
				pick(userPermissions, ['firstName', 'lastName', 'company', 'user']),
				...roles.map(({ key: requiredValue }) => {
					return {
						value: userPermissions.key,
						checked: requiredValue === userPermissions.key,
						disabled: disabled || requiredValue === MODEL_ROLES_TYPES.ADMINISTRATOR,
						onChange: this.createPermissionsChangeHandler(userPermissions, requiredValue)
					};
				})
			];

			const selected = selectedUsers.some(({ user }) => user === userPermissions.user);
			return { ...userPermissions, data, selected, disabled };
		});
	}

	public componentDidMount() {
		this.setState({
			cells: this.getTableCells(this.props.roles),
			rows: this.getTableRows(this.props.permissions, this.props.roles, [])
		});
	}

	public componentDidUpdate(prevProps, prevState) {
		const changes = {} as any;

		const selectedPermissionsChanged = (prevState.selectedGlobalPermissions !== this.state.selectedGlobalPermissions) ||
			prevState.selectedUsers.length !== this.state.selectedUsers.length;

		if (selectedPermissionsChanged) {
			changes.cells = this.getTableCells(this.props.roles);
		}

		const permissionsChanged = !isEqual(prevProps.permissions, this.props.permissions)
			|| (this.state.selectedUsers.length !== prevState.selectedUsers.length);

		if (selectedPermissionsChanged || permissionsChanged) {
			changes.selectedGlobalPermissions = UNDEFINED_PERMISSIONS;
			changes.rows = this.getTableRows(this.props.permissions, this.props.roles, this.state.selectedUsers);
			changes.currentUser = this.props.permissions.find(({ isCurrentUser }) => isCurrentUser) || {};
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public handleSelectionChange = (rows) => {
		if (this.props.onSelectionChange) {
			this.props.onSelectionChange(rows);
		}
		this.setState({selectedUsers: rows });
	}

	public renderCustomCheckbox = (props, row) => {
		if (row.data && this.hasDisabledPermissions(row)) {
			return (
				<AdminIcon
					isTeamspaceAdmin={row.isAdmin}
					isProjectAdmin={row.isProjectAdmin}
				/>
			);
		}
		return <CheckboxField {...props} />;
	}

	public render() {
		const {rows, cells } = this.state;

		return (
			<>
				{cells.length ? (
					<CustomTable
						cells={cells}
						rows={rows}
						onSelectionChange={this.handleSelectionChange}
						renderCheckbox={this.renderCustomCheckbox}
					/>
				) : null}
			</>
		);
	}
}
