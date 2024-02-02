/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { ActionMenu } from '@controls/actionMenu';
import styled, { css } from 'styled-components';
import { Chip } from '@controls/chip/chip.component';

export const RuleActionMenu = styled(ActionMenu).attrs({
	PopoverProps: {
		anchorOrigin: {
			vertical: 'bottom',
			horizontal: 'left',
		},
		transformOrigin: {
			vertical: 'top',
			horizontal: 'left',
		},
	},
})``;

export const ChipWrapper = styled.div`
	max-width: 100%;
`;

export const RuleChip = styled(Chip).attrs(({
	theme: { palette },
	$selected,
}: { theme: any, $selected: boolean }) => ({
	color: $selected ? palette.tertiary.main : palette.secondary.main,
	variant: 'filled',
}))<{ $selected: boolean, disabled?: boolean }>`
	.MuiChip-label {
		text-transform: initial;
		font-weight: initial;
		font-size: 10px;
	}

	.MuiChip-deleteIcon {
		margin: 0 -4px 0 0;
		display: flex;
		justify-content: center;
		align-items: center;

		&:hover {
			color: currentColor;
		}

		svg {
			width: 9px;
			height: 9px;
		}
	}

	.MuiChip-root {
		${({ disabled }) => disabled && css`cursor: default;`}
	}
`;
