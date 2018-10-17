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
import * as queryString from 'query-string';
import { pick, isEmpty } from 'lodash';
import SimpleBar from 'simplebar-react';

import { MODEL_ROLES_LIST } from '../../constants/model-permissions';
import { CELL_TYPES, CustomTable } from '../components/customTable/customTable.component';
import { CellUserSearch } from '../components/customTable/components/cellUserSearch/cellUserSearch.component';
import { ModelItem } from '../components/modelItem/modelItem.component';
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
	location: any;
	models: any[];
	selectedModels: any[];
	permissions: any[];
	onSelectionChange: (selectedModels) => void;
	onPermissionsChange: (modelsWithPermissions, updatedPermissions) => void;
}

interface IState {
	modelRows: any[];
	currentUser: any;
	permissionsRevision: number;
}

export class ModelsPermissions extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps(nextProps: IProps) {
		return {
			modelRows: getModelsTableRows(nextProps.models, nextProps.selectedModels),
			currentUser: (nextProps.permissions || []).find(({ isCurrentUser }) => isCurrentUser) || {}
		};
	}

	public state = {
		modelRows: [],
		currentUser: {},
		permissionsRevision: 0
	};

	public hasDisabledPermissions = (row) => {
		const {currentUser} = this.state as IState;
		const {selectedModels} = this.props;

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
			const modelsWithPermissions = this.props.selectedModels.map((selectedModel) => {
				const newPermissions = selectedModel.permissions.map((currentPermission) => {
					const memberPermission = permissions.find(({user}) => user === currentPermission.user);
					return {
						user: currentPermission.user,
						permission: memberPermission ? memberPermission.key : currentPermission.permission
					};
				}).filter(({ permission }) => permission);

				return {
					...pick(selectedModel, ['name', 'model', 'federate', 'subModels']),
					permissions: newPermissions
				};
			});

			this.props.onPermissionsChange(modelsWithPermissions, permissions);
		}
	}

	public componentDidMount() {
		this.setState({
			modelRows: getModelsTableRows(this.props.models, this.props.selectedModels)
		});
	}

	public componentDidUpdate(prevProps) {
		const changes = {} as IState;

		if (prevProps.models.length !== this.props.models.length) {
				const queryParams = queryString.parse(this.props.location.search);
				if (queryParams.modelId) {
						const selectedModel = this.props.models.find(({ model }) => model === queryParams.modelId);
						if (selectedModel) {
								this.props.onSelectionChange([selectedModel]);
						}
				}
		}

		const modelsSelectionChanged = prevProps.selectedModels.length !== this.props.selectedModels.length;
		if (modelsSelectionChanged) {
			changes.permissionsRevision = Math.random();
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public render() {
		const {models, permissions, selectedModels} = this.props;
		const {modelRows, permissionsRevision} = this.state;

		return (
			<Container
				container
				direction="row"
				wrap="nowrap"
			>
				<ModelsContainer item>
					<CustomTable
						cells={MODEL_TABLE_CELLS}
						rows={modelRows}
						onSelectionChange={this.props.onSelectionChange}
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
								key={permissionsRevision}
								permissions={permissions}
								roles={MODEL_ROLES_LIST}
								onPermissionsChange={this.handlePermissionsChange}
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
		);
	}
}
