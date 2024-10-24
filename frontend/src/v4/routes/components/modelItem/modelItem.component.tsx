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
import { Tooltip } from '@mui/material';

import { formatMessage } from '@/v5/services/intl';
import { ModelType } from '@/v5/store/projects/projects.helpers';
import { Highlight } from '../highlight/highlight.component';
import { Container, Detail, Name } from './modelItem.styles';

interface IProps {
	name: string;
	modelType?: ModelType
	searchText?: string;
}

export const ModelItem = ({name, modelType, searchText = ''}: IProps) => {
	const modelTypeLabel = () => {
		switch (modelType) {
			case ModelType.CONTAINER:
				return formatMessage({ id: 'userPermissions.modelTable.modelType.container', defaultMessage: 'Container'})
			case ModelType.FEDERATION:
				return formatMessage({ id: 'userPermissions.modelTable.modelType.federation', defaultMessage: 'Federation'})
			case ModelType.DRAWING:
				return formatMessage({ id: 'userPermissions.modelTable.modelType.drawing', defaultMessage: 'Drawing'})
			default:
				return modelType
		}
	}

	return (
		<Container>
			<Tooltip title={name}>
				<Name>
					<Highlight
						search={searchText}
						text={name}
					/>
				</Name>
			</Tooltip>
			<Detail>
				<Highlight
					search={searchText}
					text={modelTypeLabel()}
				/>
			</Detail>
		</Container>
	);
};
