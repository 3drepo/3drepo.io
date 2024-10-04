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

import Radio from '@mui/material/Radio';
import Tooltip from '@mui/material/Tooltip';
import { isEmpty, isEqual, memoize, pick } from 'lodash';
import { PureComponent } from 'react';

import AdminIconSrc from '@assets/icons/v4/how_to_reg.svg';
import { updatePermissionsOrTriggerModal } from '@components/shared/updatePermissionModal/updatePermissionModal.component';
import { getProjectPermissionLabelFromType, PROJECT_ROLES_LIST } from '@/v4/constants/project-permissions';
import { getModelPermissionLabelFromType, MODEL_ROLES_TYPES } from '../../../constants/model-permissions';
import { CellUserSearch } from '../customTable/components/cellUserSearch/cellUserSearch.component';
import { TableHeadingRadio } from '../customTable/components/tableHeadingRadio/tableHeadingRadio.component';
import { CheckboxField, CustomTable, CELL_TYPES } from '../customTable/customTable.component';
import { UserItem } from '../userItem/userItem.component';
import { ModelItem } from '../modelItem/modelItem.component';
import {
	DisabledCheckbox,
	PermissionsCellContainer
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

const SHARED_TABLE_CELLS_PROPS = {
	type: CELL_TYPES.USER,
	HeadingComponent: CellUserSearch,
	HeadingProps: {
		root: {
			width: '180px',
			padding: '0 0 0 24px',
			flex: null
		}
	},
	CellProps: {
		root: {
			width: '180px',
			padding: '0 0 0 24px',
			flex: null
		}
	},
};

const USERS_PERMISSIONS_TABLE_CELLS = [{
	name: 'User',
	...SHARED_TABLE_CELLS_PROPS,
	CellComponent: UserItem,
	searchBy: ['firstName', 'lastName', 'user', 'company']
}];

const MODEL_PERMISSIONS_TABLE_CELLS = [{
	name: 'Model',
	...SHARED_TABLE_CELLS_PROPS,
	CellComponent: ModelItem,
	searchBy: ['model', 'name']
}];

MODEL_PERMISSIONS_TABLE_CELLS[0].HeadingProps.root.width = '220px';
MODEL_PERMISSIONS_TABLE_CELLS[0].CellProps.root.width = '220px';

interface IProps {
	className?: string;
	permissions: any[];
	roles: any[];
	context?: string;
	onSelectionChange?: (selectedUsers) => void;
	onFilterChange?: (filteredUsers) => void;
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

export const PermissionsTableContexts = {
	USERS: 'USERS',
	MODELS: 'MODELS'
};

export class PermissionsTable extends PureComponent<IProps, IState> {
	public static defaultProps = {
		context: PermissionsTableContexts.USERS
	};

	public state = {
		rows: [],
		cells: [],
		selectedUsers: [],
		selectedGlobalPermissions: UNDEFINED_PERMISSIONS,
		currentUser: {}
	};

	public get permissionsCells() {
		if (this.props.context === PermissionsTableContexts.USERS) {
			return USERS_PERMISSIONS_TABLE_CELLS;
		}

		return MODEL_PERMISSIONS_TABLE_CELLS;
	}

	public get activeSelection() {
		return !!this.props.onSelectionChange;
	}

	private getPermissionsLabelFromType(type) {
		return isEqual(PROJECT_ROLES_LIST, this.props.roles) ? getProjectPermissionLabelFromType(type) : getModelPermissionLabelFromType(type);
	}

	public onGlobalPermissionsChange = (event, value) => {
		const updatedPermissions = this.state.rows
			.reduce((permissionsList, row) => {
				if (row.selected && !row.disabled) {
					permissionsList.push({ ...row, key: value });
				}
				return permissionsList;
			}, []);

			this.setState({ selectedGlobalPermissions: value });
			this.props.onPermissionsChange?.(updatedPermissions);
	};

	public hasDisabledPermissions(row) {
		if (this.props.rowStateInterceptor) {
			return this.props.rowStateInterceptor(row);
		}
		return row.disabled;
	}

	public createPermissionsChangeHandler = (permissions, value) => () => {
		this.props.onPermissionsChange?.([{
			...permissions,
			key: value
		}]);
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
			...this.permissionsCells,
			...cells
		];
	}

	public getUserCell = (userPermissions) => pick(userPermissions, ['firstName', 'lastName', 'company', 'user']);
	public getModelCell = (modelPermissions) => pick(modelPermissions, ['model', 'name', 'isFederation']);

	public getTableRows = (permissions = [], roles = [], selectedUsers = []) => {
		const isUsersContext = this.props.context === PermissionsTableContexts.USERS;
		return permissions.map((permissionsMap) => {
			const disabled = this.hasDisabledPermissions(permissionsMap);

			const data = [
				isUsersContext ? this.getUserCell(permissionsMap) : this.getModelCell(permissionsMap),
				...roles.map(({ key: requiredValue }) => {
					return {
						value: permissionsMap.key,
						checked: requiredValue === permissionsMap.key,
						disabled: disabled || requiredValue === MODEL_ROLES_TYPES.ADMINISTRATOR,
						onChange: this.createPermissionsChangeHandler(permissionsMap, requiredValue)
					};
				})
			];

			const selected = selectedUsers.some(({ user }) => user === permissionsMap.user);
			return { ...permissionsMap, data, selected, disabled };
		});
	}

	public componentDidMount() {
		const rows = this.getTableRows(this.props.permissions, this.props.roles, []);

		this.setState({
			cells: this.getTableCells(this.props.roles),
			rows,
			selectedUsers: this.activeSelection ? [] : rows
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
			const rows = this.getTableRows(this.props.permissions, this.props.roles, this.state.selectedUsers);
			changes.selectedGlobalPermissions = UNDEFINED_PERMISSIONS;
			changes.rows = rows;
			changes.selectedUsers = this.activeSelection ? this.state.selectedUsers : rows;
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
		const { rows, cells } = this.state;
		const onSelectionChange = this.activeSelection ? this.handleSelectionChange : null;
		return (
			<>
				{ cells.length ? (
					<CustomTable
						className={this.props.className}
						cells={cells}
						rows={rows}
						onSelectionChange={onSelectionChange}
						onFilterChange={this.props.onFilterChange}
						renderCheckbox={this.renderCustomCheckbox}
					/>
				) : null }
			</>
		);
	}
}
