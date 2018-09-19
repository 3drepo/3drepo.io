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
import { pick } from 'lodash';
import { MuiThemeProvider } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import { CELL_TYPES, CustomTable } from '../components/customTable/customTable.component';
import { theme } from '../../styles';
import { Container } from './modelsPermissions.styles';

const MODEL_TABLE_CELLS = [{
	name: 'Name',
	type: CELL_TYPES.NAME,
	searchBy: ['name']
}];

const getModelsTableRows = (models = [], selectedModels = []): any[] => {
	return models.map((model) => {
		const data = [
			pick(model, ['name'])
		];

		const selected = selectedModels.some((selectedModel) => selectedModel.model === model.model);
		return { ...model, data, selected };
	});
};

interface IProps {
	models: any[];
}

interface IState {
	modelRows: any[];
	selectedModels: any[];
	selectedUsers: any[];
}

export class ModelsPermissions extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
		return {
			modelRows: getModelsTableRows(nextProps.models, prevState.selectedModels)
		};
	}

	public state = {
		modelRows: [],
		selectedModels: [],
		selectedUsers: []
	};

	public getModelsTableRows = (models = []): any[] => {
		return models.map((job) => {
			const data = [
				pick(job, ['name'])
			];
			return { ...job, data };
		});
	}

	public handleModelsSelectionChange = (rows) => {
		this.setState({selectedModels: rows});
	}

	public render() {
		const {models} = this.props;
		const {modelRows} = this.state;

		return (
			<MuiThemeProvider theme={theme}>
				<Container>
					<Grid container>
						<Grid item>
							<CustomTable
								cells={MODEL_TABLE_CELLS}
								rows={modelRows}
								onSelectionChange={this.handleModelsSelectionChange}
							/>
						</Grid>
					</Grid>
				</Container>
			</MuiThemeProvider>
		);
	}
}
