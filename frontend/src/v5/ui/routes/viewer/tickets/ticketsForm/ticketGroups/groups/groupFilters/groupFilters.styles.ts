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
import { Menu } from '@controls/actionMenu/actionMenu.styles';
import { Typography } from '@controls/typography';
import styled from 'styled-components';
import { Chip } from '@controls/chip/chip.component';

const BaseFilterActionMenu = styled(ActionMenu)`
	${Menu} {
		padding: 14px;
		display: flex;
		flex-direction: column;
		width: 328px;
		border-radius: 10px;
	}
`;

export const EditFilterActionMenu = styled(BaseFilterActionMenu).attrs({
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

export const NewFilterActionMenu = styled(BaseFilterActionMenu).attrs({
	PopoverProps: {
		anchorOrigin: {
			vertical: 'top',
			horizontal: 'right',
		},
		transformOrigin: {
			vertical: 'top',
			horizontal: 'left',
		},
	},
})`
	.MuiPaper-root {
		margin-left: 15px;
		box-shadow: ${({ theme }) => theme.palette.shadows.level_5};
	}
`;

export const TriggerButton = styled(Typography).attrs({
	variant: 'link',
})`
	cursor: pointer;
	margin-left: auto;
	width: fit-content;
`;

export const Filters = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 4px;
`;

export const ChipWrapper = styled.div`
	max-width: 100%;
`;

export const ChipLabel = styled.div`
	display: inline-flex;
	flex-direction: row;
`;

export const FilterChip = styled(Chip).attrs(({
	theme: { palette },
	$selected,
}: { theme: any, $selected: boolean }) => ({
	color: $selected ? palette.tertiary.main : palette.secondary.main,
	variant: 'filled',
}))<{ $selected: boolean }>`
	.MuiChip-label {
		text-transform: initial;
		font-weight: initial;
	}

	svg.MuiChip-deleteIcon {
		margin: 0 0 0 5px;
		width: 9px;
		height: 9px;

		&:hover {
			color: currentColor;
		}
	}
`;
