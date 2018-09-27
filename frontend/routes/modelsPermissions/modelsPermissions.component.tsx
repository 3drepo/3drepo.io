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
import * as AdminIconSrc from '../../icons/how_to_reg.svg';

import { theme } from '../../styles';
import { MODEL_ROLES_TYPES, MODEL_ROLES_LIST } from '../../constants/model-permissions';
import { CELL_TYPES, CustomTable, CheckboxField } from '../components/customTable/customTable.component';
import { CellUserSearch } from '../components/customTable/components/cellUserSearch/cellUserSearch.component';
import { ModelItem } from '../components/modelItem/modelItem.component';
import { TableHeadingRadio } from '../components/customTable/components/tableHeadingRadio/tableHeadingRadio.component';
import { UserItem } from '../components/userItem/userItem.component';
import { TextOverlay } from '../components/textOverlay/textOverlay.component';
import { PermissionsTable } from '../components/permissionsTable/permissionsTable.component';

import {
	Container,
	ModelsContainer,
	PermissionsContainer,
	OverflowWrapper
} from './modelsPermissions.styles';

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

interface IProps {
	models: any[];
	permissions: any[];
	onSelectionChange: (selectedModels) => void;
	onPermissionsChange: (updatedPermissions) => void;
}

interface IState {
	modelRows: any[];
	selectedModels: any[];
	currentUser: any;
}

export class ModelsPermissions extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
		return {
			modelRows: getModelsTableRows(nextProps.models, prevState.selectedModels),
			currentUser: (nextProps.permissions || []).find(({ isCurrentUser }) => isCurrentUser) || {}
		};
	}

	public state = {
		modelRows: [],
		selectedModels: [],
		currentUser: {}
	};

	public hasDisabledPermissions = (row) => {
		const {currentUser, selectedModels} = this.state as IState;

		const hasSelectedModels = selectedModels.length;
		const passBaseValidation = !hasSelectedModels || row.disabled || row.isOwner || row.isAdmin || row.isCurrentUser;

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

		return false;
	}

	public createPermissionsChangeHandler = (permissions, value) => () => {
		this.props.onPermissionsChange([{
			...permissions,
			key: value
		}]);
	}

	public componentDidMount() {
		this.setState({
			modelRows: getModelsTableRows(this.props.models, this.state.selectedModels)
		});
	}

	public handleSelectionChange = (field) => (rows) => {
		const handleChange = cond([
			[matches('selectedModels'), () => this.props.onSelectionChange(rows)]
		])(field);

		this.setState({[field]: rows});
	}

	public handleModelsSearch = ({rows, searchFields, searchText}) => {
		if (!searchText) {
			return rows;
		}

		const modelsRequired = 'model'.includes(searchText);
		const federationsRequired = 'federation'.includes(searchText);
		return rows.filter(({ name, federate }) => {
			return name.toLowerCase().includes(searchText) ||
				(modelsRequired && !federate) ||
				(federationsRequired && federate);
		});
	}

	public render() {
		const {models, permissions} = this.props;
		const {modelRows, selectedModels} = this.state;

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
							onSearch={this.handleModelsSearch}
						/>
						{ !models.length ?
								<TextOverlay content="Select a project to view the models' list" /> :
								null
						}
					</ModelsContainer>
					<PermissionsContainer item>
						<OverflowWrapper>
							<SimpleBar data-simplebar-y-hidden>
								<PermissionsTable
									permissions={permissions}
									roles={MODEL_ROLES_LIST}
									onSelectionChange={this.handleSelectionChange('selectedUsers')}
									onPermissionsChange={this.props.onPermissionsChange}
									rowStateInterceptor={this.hasDisabledPermissions}
								/>
							</SimpleBar>
						</OverflowWrapper>
						{
							!selectedModels.length ?
								<TextOverlay content="Select a model to view the users' permissions" /> :
								null
						}
					</PermissionsContainer>
				</Container>
			</MuiThemeProvider>
		);
	}
}
