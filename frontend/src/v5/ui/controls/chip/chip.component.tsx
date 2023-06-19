/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { Chip as MuiChip, Tooltip } from '@mui/material';
import CrossIcon from '@assets/icons/outlined/close-outlined.svg';
import { ChipWrapper } from './chip.styles';
import { IChip } from './chip.types';

export const Chip = ({ color, variant, tooltip = '', disabled, className, ...props }: IChip) => (
	<ChipWrapper variant={variant} color={color} disabled={disabled} className={className}>
		<Tooltip title={disabled ? '' : tooltip} arrow>
			<MuiChip clickable={false} deleteIcon={<CrossIcon />} {...props} />
		</Tooltip>
	</ChipWrapper>
);
