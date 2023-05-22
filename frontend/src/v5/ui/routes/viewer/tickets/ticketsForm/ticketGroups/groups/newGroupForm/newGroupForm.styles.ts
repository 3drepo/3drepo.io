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
import { Typography } from '@controls/typography';
import styled from 'styled-components';

export const Form = styled.form`
	padding: 15px;
	display: flex;
	flex-direction: column;
	width: 393px;
`;

export const SectionTitle = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	color: ${({ theme }) => theme.palette.secondary.main};
	margin: 15px 0 11px;
`;

export const InputsSection = styled.div`
	border-radius: 8px;
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
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

export const Rules = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	padding: 10px;
	gap: 4px;
`;

export const ChipLabel = styled.div`
	display: inline-flex;
	flex-direction: row;
`;
