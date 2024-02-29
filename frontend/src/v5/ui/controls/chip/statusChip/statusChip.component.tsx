/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { Chip } from '../chip.component';
import { IChip } from '../chip.types';
import { getStatusChipProps } from '../chip.helpers';

export type StatusChipProps = {
	value: string,
	templateId: string,
	modelId?: string,
};
export const StatusChip = ({ value, templateId, modelId, ...props }: StatusChipProps & IChip) => {
	const chipProps = getStatusChipProps({ templateId, value, modelId });
	if (!value) return null;
	return <Chip {...chipProps} {...props} />;
};