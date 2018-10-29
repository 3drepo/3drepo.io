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
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';

import { HeaderCell, HeaderCheckboxWrapper } from './subModelsTable.styles';

interface IProps {
	title: string;
	models: any[];
	selectedModels: any[];
	icon: string;
	handleAllClick: (event) => void;
	handleIconClick: () => void;
	handleItemClick: (event, modelName) => void;
	checkboxDisabled: boolean;
}

const isSelected = (list, name) => list.indexOf(name) !== -1;

export const SubModelsTable = (props: IProps) => {
	const {
		icon,
		title,
		models,
		selectedModels,
		handleAllClick,
		handleIconClick,
		handleItemClick,
		checkboxDisabled
	} = props;

	return (
		<Table>
			<TableHead>
				<TableRow>
					<HeaderCell padding="none">
						<HeaderCheckboxWrapper>
							<Checkbox
								indeterminate={selectedModels.length > 0 && selectedModels.length < models.length}
								checked={Boolean(models.length) && models.length === selectedModels.length}
								onChange={handleAllClick}
								disabled={checkboxDisabled}
							/>
							<Typography>{title}</Typography>
						</HeaderCheckboxWrapper>
						<IconButton onClick={handleIconClick} disabled={checkboxDisabled || !selectedModels.length}>
							<Icon>{icon}</Icon>
						</IconButton>
					</HeaderCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{models
					.map((model) => {
						const isModelSelected = isSelected(selectedModels, model.name);
						return (
							<TableRow
								key={model.name} role="checkbox" selected={isModelSelected}
								onClick={(event) => handleItemClick(event, model.name)}
							>
								<TableCell padding="none">
									<Checkbox checked={isModelSelected} /> {model.name}
								</TableCell>
							</TableRow>
						);
					})}
			</TableBody>
		</Table>
	);
};
