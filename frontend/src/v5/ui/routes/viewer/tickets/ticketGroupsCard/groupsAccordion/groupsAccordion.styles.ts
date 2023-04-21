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

import styled, { css } from 'styled-components';
import { Accordion as AccordionBase } from '@controls/accordion/accordion.component';
import { CentredContainer } from '@controls/centredContainer';
import CheckboxBase from '@mui/material/Checkbox';
import { GroupCollectionAccordion, GroupItemContainer } from '../groups/groups.styles';

export const Accordion = styled(AccordionBase)<{ groupsCount?: number }>`
	background: transparent;

	&& {
		border-radius: 0;
		border: 0;
	}

	.MuiAccordionSummary-root {
		border-bottom: 1px solid ${({ theme }) => theme.palette.secondary.lightest};
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		min-height: 41px;
	}

	.MuiAccordionDetails-root {
		border-top: 0;
		padding: 14px;
		display: flex;
		flex-direction: column;
	}

	&.Mui-expanded + & .MuiAccordionSummary-root {
		border-top: 1px solid ${({ theme }) => theme.palette.secondary.lightest};
	}

	${GroupCollectionAccordion} :is(${GroupCollectionAccordion}, ${GroupItemContainer}) {
		position: relative;

		&::after {
			content: "";
			background: transparent;
			box-sizing: border-box;
			border-bottom: solid 1px ${({ theme }) => theme.palette.base.lightest};
			border-left: solid 1px ${({ theme }) => theme.palette.base.lightest};
			width: 9px;
			left: -9px;
			position: absolute;
			${({ groupsCount = 0 }) => css`
				border-right: ${(groupsCount + 1)}px;
				height: ${(groupsCount + 1) * 61}px;
				top: -${(groupsCount + 1) * 61 - 22}px;
			`}
		}

		&:last-child::after {
			border-left: solid 1px ${({ theme }) => theme.palette.base.lightest};
			border-bottom-left-radius: 5px;
		}
	}
`;

export const TitleContainer = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

export const NumberContainer = styled(CentredContainer)`
	border-radius: 26px;
    width: 26px;
    height: 26px;
	margin-left: 3px;
	background-color: ${({ theme }) => theme.palette.tertiary.lighter};
	color: currentColor;
`;

export const Checkbox = styled(CheckboxBase)`
	margin-left: auto;
`;
