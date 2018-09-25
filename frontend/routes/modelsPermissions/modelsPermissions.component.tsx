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

import { theme } from '../../styles';
import { MODEL_ROLES_TYPES, MODEL_ROLES_LIST } from '../../constants/model-permissions';
import { CELL_TYPES, CustomTable, CheckboxField } from '../components/customTable/customTable.component';
import { CellUserSearch } from '../components/customTable/components/cellUserSearch/cellUserSearch.component';
import { ModelItem } from '../components/modelItem/modelItem.component';
import { TableHeadingRadio } from '../components/customTable/components/tableHeadingRadio/tableHeadingRadio.component';
import { UserItem } from '../components/userItem/userItem.component';
import { TextOverlay } from '../components/textOverlay/textOverlay.component';

import * as TestIconSrc from '../../icons/how_to_reg.svg';

import {
	Container,
	ModelsContainer,
	PermissionsContainer,
	PermissionsCellContainer,
	DisabledCheckbox
} from './modelsPermissions.styles';

const PermissionsCell = ({disabled, checked, onChange}) => {
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

const AdminIcon = ({isTeamspaceAdmin, isProjectAdmin}) => {
	const tooltipTitle = getAdminIconText(isTeamspaceAdmin, isProjectAdmin);
	return (
		<Tooltip title={tooltipTitle}>
			<DisabledCheckbox src={TestIconSrc} />
		</Tooltip>
	);
};

const UNDEFINED_PERMISSIONS = 'undefined';

const MODEL_TABLE_CELLS = [{
	name: 'Model/federation',
	type: CELL_TYPES.NAME,
	HeadingComponent: CellUserSearch,
	CellComponent: ModelItem,
	searchBy: ['name']
}];

const getModelsTableRows = (models = [], selectedModels = []) => {
	return models.map((model) => {
		const data = [
			{
				name: model.name,
				isFederation: model.federate
			}
		];

		const selected = selectedModels.some((selectedModel) => selectedModel.model === model.model);
		return { ...model, data, selected };
	});
};

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
	models: any[];
	users: any[];
	permissions: any[];
	onSelectionChange?: (selectedModels) => void;
	onPermissionsChange?: (updatedPermissions) => void;
}

interface IState {
	modelRows: any[];
	permissionsRows: any[];
	permissionsCells: any[];
	selectedModels: any[];
	selectedUsers: any[];
	selectedGlobalPermissions: string;
	currentUser: any;
}

export class ModelsPermissions extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
		const changes = {
			modelRows: getModelsTableRows(nextProps.models, prevState.selectedModels)
		} as any;

		if (nextProps.permissions) {
			changes.currentUser = nextProps.permissions.find(({ isCurrentUser }) => isCurrentUser) || {};
		}
		return changes;
	}

	public state = {
		modelRows: [],
		permissionsRows: [],
		permissionsCells: [],
		selectedModels: [],
		selectedUsers: [],
		selectedGlobalPermissions: UNDEFINED_PERMISSIONS,
		currentUser: {}
	};

	public onGlobalPermissionsChange = (event, value) => {
		this.setState({selectedGlobalPermissions: value});

		if (this.props.onPermissionsChange) {
			const updatedPermissions = this.state.permissionsRows
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
		const {currentUser, selectedModels} = this.state as IState;

		const hasSelectedModels = selectedModels.length;
		const passBaseValidation = !hasSelectedModels || row.isDisabled || row.isOwner || row.isAdmin || row.isCurrentUser;

		if (passBaseValidation) {
			return true;
		}

		if (!passBaseValidation) {
			if (row.isProjectAdmin) {
				return true;
			}

			if (row.isModelAdmin) {
				return !(currentUser.isAdmin || currentUser.isOwner || currentUser.isProjectAdmin);
			}
		}
	}

	public createPermissionsChangeHandler = (permissions, value) => () => {
		if (this.props.onPermissionsChange) {
			this.props.onPermissionsChange([{
				...permissions,
				key: value
			}]);
		}
	}

	public getPermissionsTableCells = () => {
		const permissionCellProps = {
			width: '110px',
			flex: null,
			padding: '0'
		};
		console.log('getPermissionsTableCells', this.state.selectedUsers.length, !this.state.selectedUsers.length);
		const permissionsCells = MODEL_ROLES_LIST.map(({ label: name, tooltip: tooltipText, key: value }) => {
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
						disabled: !this.state.selectedUsers.length
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
			...permissionsCells
		];
	}

	public getPermissionsTableRows = (permissions = [], selectedUsers = []) => {
		return permissions.map((userPermissions) => {
			const data = [
				pick(userPermissions, ['firstName', 'lastName', 'company', 'user']),
				...MODEL_ROLES_LIST.map(({key: requiredValue }) => {
					return {
						value: userPermissions.key,
						checked: requiredValue === userPermissions.key,
						disabled: this.hasDisabledPermissions(userPermissions),
						onChange: this.createPermissionsChangeHandler(userPermissions, requiredValue)
					};
				})
			];

			const selected = selectedUsers.some(({ user }) => user === userPermissions.user);
			return { ...userPermissions, data, selected };
		});
	}

	public componentDidMount() {
		this.setState({
			permissionsCells: this.getPermissionsTableCells(),
			permissionsRows: this.getPermissionsTableRows(this.props.permissions, []),
			modelRows: getModelsTableRows(this.props.models, this.state.selectedModels)
		});
	}

	public componentDidUpdate(prevProps, prevState) {
		const changes = {} as any;
		console.time('did update');
		const selectedPermissionsChanged = (prevState.selectedGlobalPermissions !== this.state.selectedGlobalPermissions) ||
			prevState.selectedUsers.length !== this.state.selectedUsers.length;

		if (selectedPermissionsChanged) {
			changes.permissionsCells = this.getPermissionsTableCells();
		}

		const permissionsChanged = !isEqual(prevProps.permissions, this.props.permissions)
			|| (this.state.selectedUsers.length !== prevState.selectedUsers.length);

		if (permissionsChanged) {
			changes.selectedGlobalPermissions = UNDEFINED_PERMISSIONS;
			changes.permissionsRows = this.getPermissionsTableRows(this.props.permissions, this.state.selectedUsers);
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
		console.timeEnd('did update');
	}

	public handleSelectionChange = (field) => (rows) => {
		const handleChange = cond([
			[matches('selectedModels'), () => this.props.onSelectionChange(rows)]
		])(field);

		this.setState({[field]: rows});
	}

	public renderCustomCheckbox = (props, row) => {
		if (this.state.selectedModels.length && row.data && this.hasDisabledPermissions(row)) {
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
		const {models} = this.props;
		const {modelRows, permissionsRows, permissionsCells, selectedModels} = this.state;

		return (
			<MuiThemeProvider theme={theme}>
				<Container
					container
					direction="row"
					wrap="nowrap"
				>
					<ModelsContainer item>
						<CustomTable
							cells={MODEL_TABLE_CELLS}
							rows={modelRows}
							onSelectionChange={this.handleSelectionChange('selectedModels')}
						/>
						{ !models.length ?
								<TextOverlay content="Select a project to view the models' list" /> :
								null
						}
					</ModelsContainer>
					<PermissionsContainer item>
						<SimpleBar data-simplebar-y-hidden>
							<CustomTable
								cells={permissionsCells}
								rows={permissionsRows}
								onSelectionChange={this.handleSelectionChange('selectedUsers')}
								renderCheckbox={this.renderCustomCheckbox}
							/>
						</SimpleBar>
						{ !selectedModels.length ?
								<TextOverlay content="Select a model to view the users' permissions" /> :
								null
						}
					</PermissionsContainer>
				</Container>
			</MuiThemeProvider>
		);
	}
}
