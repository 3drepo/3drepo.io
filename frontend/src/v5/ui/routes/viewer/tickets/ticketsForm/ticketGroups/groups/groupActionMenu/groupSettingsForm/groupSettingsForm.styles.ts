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

import { FONT_WEIGHT } from '@/v5/ui/themes/theme';
import { ActionMenu } from '@controls/actionMenu';
import { Toggle as BaseToggle } from '@controls/inputs/toggle/toggle.component';
import { Typography } from '@controls/typography';
import { InputLabel } from '@mui/material';
import styled from 'styled-components';

export const FormBox = styled.div`
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	border-radius: 8px;
	padding: 10px 15px;
	margin-bottom: 5px;
`;

export const FormRulesBox = styled(FormBox)`
	padding: 10px;
`;

export const FormRow = styled.div`
	margin-bottom: 12px;
`;

export const LabelAndColor = styled(FormRow)`
	width: 100%;
	display: inline-flex;
	gap: 10px;
	align-items: end;
`;

export const Heading = styled.div`
	${({ theme }) => theme.typography.h3};
	color: ${({ theme }) => theme.palette.secondary.main};
	padding: 5px 3px;
`;

export const Subheading = styled.div`
	${({ theme }) => theme.typography.h5};
	color: ${({ theme }) => theme.palette.secondary.main};
	padding: 10px 3px;
	font-weight: ${FONT_WEIGHT.BOLD};
	display: flex;
	justify-content: space-between;
`;

export const NewCollectionActionMenu = styled(ActionMenu).attrs({
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
		margin-left: 27px;
		box-shadow: ${({ theme }) => theme.palette.shadows.level_5};
	}
`;

export const NewCollectionLink = styled.div`
	${({ theme }) => theme.typography.link};
	color: ${({ theme }) => theme.palette.secondary.main};
	font-weight: ${FONT_WEIGHT.BOLD};
	padding: 10px 1px;
	cursor: pointer;
	width: 100%;
`;

export const Instruction = styled.div`
	${({ theme }) => theme.typography.label};
	color: ${({ theme }) => theme.palette.base.main};
	padding: 4px 0 0;
`;

export const Buttons = styled.div`
	display: flex;
	justify-content: flex-end;
	button {
		margin: 10px 0 0;
	}
`;

export const ToggleLabel = styled(InputLabel)<{ disabled: boolean }>`
	${({ theme }) => theme.typography.body1};
	color: ${({ theme }) => theme.palette.secondary.main};
	position: unset;
	user-select: none;
	pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
`;

export const Toggle = styled(BaseToggle)`
	margin: 0 7px;
	user-select: none;
`;

export const ToggleWrapper = styled.div`
	display: flex;
`;

export const Rules = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 4px;
`;

export const AddFilterTitle = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	color: ${({ theme }) => theme.palette.secondary.main};
`;

export const NewRuleActionMenu = styled(ActionMenu).attrs({
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
