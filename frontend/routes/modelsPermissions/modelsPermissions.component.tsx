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
import { pick, matches, isEqual, cond, get } from 'lodash';
import { MuiThemeProvider } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import SimpleBar from 'simplebar-react';

import { theme } from '../../styles';
import { MODEL_ROLES_TYPES, MODEL_ROLES_LIST } from '../../constants/model-permissions';
import { CELL_TYPES, CustomTable } from '../components/customTable/customTable.component';
import { CellUserSearch } from '../components/customTable/components/cellUserSearch/cellUserSearch.component';
import { ModelItem } from '../components/modelItem/modelItem.component';
import { TableHeadingRadio } from '../components/customTable/components/tableHeadingRadio/tableHeadingRadio.component';

import { Container, ModelsContainer, PermissionsContainer } from './modelsPermissions.styles';
import { UserItem } from '../components/userItem/userItem.component';

const UNDEFINED_PERMISSIONS = 'undefined';

const MODEL_TABLE_CELLS = [{
	name: 'Model/federation',
	type: CELL_TYPES.NAME,
	HeadingComponent: CellUserSearch,
	HeadingProps: {},
	CellComponent: ModelItem,
	CellProps: {},
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
	CellComponent: UserItem,
	searchBy: ['firstName', 'lastName', 'user', 'company']
}];

const getPermissionsTableRows = (permissions = [], selectedUsers = []) => {
	return permissions.map((userPermissions) => {
		const data = [
			pick(userPermissions, ['firstName', 'lastName', 'company', 'user'])
		];

		const selected = selectedUsers.some(({ user }) => user === userPermissions.user);

		return { ...userPermissions, data, selected };
	});
};

interface IProps {
	models: any[];
	users: any[];
	permissions: any[];
	onSelectionChange?: ({selectedModels}) => void;
	onPermissionsChange?: ({updatedPermissions}) => void;
}

interface IState {
	modelRows: any[];
	permissionsRows: any[];
	permissionsCells: any[];
	selectedModels: any[];
	selectedUsers: any[];
	selectedGlobalPermissions: string;
}

export class ModelsPermissions extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
		return {
			modelRows: getModelsTableRows(nextProps.models, prevState.selectedModels),
			permissionsRows: getPermissionsTableRows(nextProps.permissions, prevState.selectedUsers)
		};
	}

	public state = {
		modelRows: [],
		permissionsRows: [],
		permissionsCells: [],
		selectedModels: [],
		selectedUsers: [],
		selectedGlobalPermissions: UNDEFINED_PERMISSIONS
	};

	public onGlobalPermissionsChange = (event, value) => {
		this.setState({selectedGlobalPermissions: value});
	}

	public getPermissionsTableCells = () => {
		const permissionsCells = MODEL_ROLES_LIST.map(({ label: name, tooltip: tooltipText, width, key: value }) => {
			return {
				name,
				type: CELL_TYPES.RADIO_BUTTON,
				HeadingComponent: TableHeadingRadio,
				HeadingProps: {
					name: 'permission',
					tooltipText,
					value,
					onChange: this.onGlobalPermissionsChange,
					checked: this.state.selectedGlobalPermissions === value
				}
				// CellComponent: Radio
			};
		});

		return [
			...PERMISSIONS_TABLE_CELLS,
			...permissionsCells
		];
	}

	public componentDidMount() {
		this.setState({
			permissionsCells: this.getPermissionsTableCells()
		});
	}

	public componentDidUpdate(prevProps, prevState) {
		if (isEqual(prevState.selectedModels, this.state.selectedModels)) {

		}

		if (prevState.selectedGlobalPermissions !== this.state.selectedGlobalPermissions) {
			this.setState({
				permissionsCells: this.getPermissionsTableCells()
			});
		}
	}

	public handlePermissionsChange = () => {

	}

	public handleSelectionChange = (field) => (rows) => {
		const handleChange = cond([
			[matches('selectedModels'), () => this.props.onSelectionChange(rows)]
		])(field);

		this.setState({[field]: rows});
	}

	public render() {
		const {models} = this.props;
		const {modelRows, permissionsRows, permissionsCells} = this.state;

		return (
			<MuiThemeProvider theme={theme}>
				<Container
					container
					direction="row"
				>
					<ModelsContainer item>
						<CustomTable
							cells={MODEL_TABLE_CELLS}
							rows={modelRows}
							onSelectionChange={this.handleSelectionChange('selectedModels')}
						/>
					</ModelsContainer>
					<PermissionsContainer item>
						<SimpleBar>
							<CustomTable
								cells={permissionsCells}
								rows={permissionsRows}
								onSelectionChange={this.handleSelectionChange('selectedUsers')}
							/>
						</SimpleBar>
					</PermissionsContainer>
				</Container>
			</MuiThemeProvider>
		);
	}
}
