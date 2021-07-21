/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import memoizeOne from 'memoize-one';
import * as queryString from 'query-string';
import React from 'react';

import { MODEL_ROLES_LIST } from '../../constants/model-permissions';
import { CellUserSearch } from '../components/customTable/components/cellUserSearch/cellUserSearch.component';
import { CustomTable, CELL_TYPES } from '../components/customTable/customTable.component';
import { ModelItem } from '../components/modelItem/modelItem.component';
import { PermissionsTable } from '../components/permissionsTable/permissionsTable.component';
import { TextOverlay } from '../components/textOverlay/textOverlay.component';

import {
	Container,
	ModelsContainer,
	OverflowWrapper,
	PermissionsContainer
} from './modelsPermissions.styles';

const MODEL_TABLE_CELLS = [{
	name: 'Model/federation',
	type: CELL_TYPES.NAME,
	HeadingComponent: CellUserSearch,
	CellComponent: ModelItem,
	searchBy: ['name']
}];

const getModelsTableRows = memoizeOne((models = [], selectedModels = []) => {
	return models.map((model) => {
		const data = [{
			name: model.name,
			isFederation: model.federate
		}];

		const selected = selectedModels.some((selectedModel) => selectedModel.model === model.model);
		return { ...model, data, selected };
	});
});

interface IProps {
	location: any;
	models: any[];
	selectedModels: any[];
	permissions: any[];
	onSelectionChange: (selectedModels) => void;
	onPermissionsChange: (modelsWithPermissions) => void;
}

interface IState {
	modelRows: any[];
	currentUser: any;
	permissionsRevision: number;
}

export class ModelsPermissions extends React.PureComponent<IProps, IState> {
	public state = {
		modelRows: [],
		currentUser: {},
		permissionsRevision: 0
	};

	public hasDisabledPermissions = (row) => {
		const { currentUser } = this.state as IState;
		const { selectedModels } = this.props;

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

	public handlePermissionsChange = (permissions) => {
		if (this.props.onPermissionsChange) {
			const modelsWithPermissions = this.props.selectedModels.map(({ model, ...modelProps }) => {
				const permissionsToSave = modelProps.permissions.reduce((updatedUserPermissions, currentPermissions) => {
					if (!currentPermissions.isAdmin) {
						const updatedPermissions = permissions.find(({ user }) =>
								user === currentPermissions.user
						);
						const permissionsKey = updatedPermissions && updatedPermissions.key;

						if (updatedPermissions) {
							updatedUserPermissions.push({
								user: currentPermissions.user,
								permission: permissionsKey || '',
							});
						}
					}

					return updatedUserPermissions;
				}, []);
				return {
					model,
					permissions: permissionsToSave
				};
			});

			this.props.onPermissionsChange(modelsWithPermissions);
		}
	}

	public componentDidMount() {
		const queryParams = queryString.parse(this.props.location.search);
		if (queryParams.modelId) {
			this.props.onSelectionChange([{model: queryParams.modelId}]);
		}
	}

	public render() {
		const { models, permissions, selectedModels } = this.props;
		const { permissionsRevision } = this.state;

		return (
			<Container
				container
				direction="row"
				wrap="nowrap"
			>
				<ModelsContainer item>
					<CustomTable
						cells={MODEL_TABLE_CELLS}
						rows={getModelsTableRows(models, selectedModels)}
						onSelectionChange={this.props.onSelectionChange}
						onSearch={this.handleModelsSearch}
					/>
					{ !models.length ?
							<TextOverlay content="Select a project to view the models' list" /> :
							null
					}
				</ModelsContainer>
				<PermissionsContainer item>
							<PermissionsTable
								key={permissionsRevision}
								permissions={permissions}
								roles={MODEL_ROLES_LIST}
								onPermissionsChange={this.handlePermissionsChange}
								rowStateInterceptor={this.hasDisabledPermissions}
							/>
					{
						!selectedModels.length ?
							<TextOverlay content="Select a model to view the users' permissions" /> :
							null
					}
				</PermissionsContainer>
			</Container>
		);
	}
}
