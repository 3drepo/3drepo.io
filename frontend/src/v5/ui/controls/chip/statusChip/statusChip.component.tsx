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

import { IChip } from '../chip.types';
import { getChipPropsFromConfig } from '../chip.helpers';
import { Chip } from './statusChip.styles';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';

export type StatusChipProps = IChip & {
	value: string,
	templateId: string,
	modelId: string,
};
export const StatusChip = ({ value, templateId, modelId, ...props }: StatusChipProps) => {
	const statusConfig = TicketsHooksSelectors.selectStatusConfigByTemplateId(modelId, templateId);
	const chipProps = getChipPropsFromConfig(statusConfig, value);
	if (!value) return null;
	return <Chip {...chipProps} {...props} />;
};