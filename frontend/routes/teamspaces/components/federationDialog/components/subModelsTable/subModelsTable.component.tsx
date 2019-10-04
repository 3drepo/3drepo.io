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

import IconButton from '@material-ui/core/IconButton';
import TableBody from '@material-ui/core/TableBody';
import Typography from '@material-ui/core/Typography';
import React from 'react';

import {
	HeaderCell,
	HeaderCheckboxWrapper,
	ModelName,
	StyledCheckbox,
	StyledTable,
	StyledTableHead,
	TableCell,
	TableRow
} from './subModelsTable.styles';

interface IProps {
	title: string;
	models: any[];
	selectedModels: any[];
	Icon: React.ComponentType;
	handleAllClick: (event) => void;
	handleIconClick: () => void;
	handleItemClick: (event, modelName) => void;
	checkboxDisabled: boolean;
}

const isSelected = (list, name) => list.indexOf(name) !== -1;

export const SubModelsTable = (props: IProps) => {
	const {
		Icon,
		title,
		models,
		selectedModels,
		handleAllClick,
		handleIconClick,
		checkboxDisabled
	} = props;

	const handleItemClick = (name) => (event) => {
		props.handleItemClick(event, name);
	};

	return (
		<StyledTable>
			<StyledTableHead>
				<TableRow>
					<HeaderCell padding="none">
						<HeaderCheckboxWrapper>
							<StyledCheckbox
								indeterminate={selectedModels.length > 0 && selectedModels.length < models.length}
								checked={Boolean(models.length) && models.length === selectedModels.length}
								onChange={handleAllClick}
								disabled={checkboxDisabled}
							/>
							<Typography>{title}</Typography>
						</HeaderCheckboxWrapper>
						<IconButton onClick={handleIconClick} disabled={checkboxDisabled || !selectedModels.length}>
							<Icon />
						</IconButton>
					</HeaderCell>
				</TableRow>
			</StyledTableHead>
			<TableBody>
				{ models
					.map((model) => {
						const isModelSelected = isSelected(selectedModels, model.name);
						return (
							<TableRow
								key={model.name} role="checkbox"
								onClick={handleItemClick(model.name)}
							>
								<TableCell padding="none">
									<StyledCheckbox checked={isModelSelected} />
									<ModelName>{model.name}</ModelName>
								</TableCell>
							</TableRow>
						);
					}) }
			</TableBody>
		</StyledTable>
	);
};
