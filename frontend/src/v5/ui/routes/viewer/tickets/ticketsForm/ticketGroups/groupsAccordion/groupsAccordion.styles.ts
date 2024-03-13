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
import { IconContainer } from '@controls/accordion/accordion.styles';
import { Button } from '@controls/button';
import { CircledNumber } from '@controls/circledNumber/circledNumber.styles';
import { CollectionAccordion } from '../groups/groups.styles';
import { Container as GroupItemContainer } from '../groups/groupItem/groupItem.styles';
import { GroupToggle } from '../groupToggle/groupToggle.component';

export const Accordion = styled(AccordionBase)<{ $overridesCount?: number, $isHiddenGroups: boolean }>`
	background: transparent;

	&& {
		border-radius: 0;
		border: 0;
	}

	.MuiAccordionSummary-root {
		border-bottom: 1px solid ${({ theme }) => theme.palette.secondary.lightest};
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		height: 42px;
		padding-left: 17px;
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

	/* stylelint-disable selector-type-no-unknown */
	${CollectionAccordion} ${CollectionAccordion},
	${CollectionAccordion} ${GroupItemContainer} {
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
			${({ $overridesCount = 0 }) => css`
				border-right: ${($overridesCount + 1)}px;
				height: ${($overridesCount + 1) * 61}px;
				top: -${($overridesCount + 1) * 61 - 22}px;
			`}
		}

		&:last-child::after {
			border-left: solid 1px ${({ theme }) => theme.palette.base.lightest};
			border-bottom-left-radius: 5px;
		}
	}

	${({ $isHiddenGroups }) => $isHiddenGroups && css`
		${IconContainer} svg {
			width: 21px;
			height: 21px;
			margin: -3px -2px 0 -3px;
		}
	`}
`;

export const TitleContainer = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

export const NumberContainer = styled(CircledNumber)`
	width: 22px;
	height: 22px;
	font-size: 10px;
`;

export const Checkbox = styled(GroupToggle)`
	margin: 0 8px 0 auto;
`;

export const NewGroupButton = styled(Button).attrs({
	variant: 'outlined',
	color: 'secondary',
})`
	align-self: flex-end;
	margin: 14px 0 3px;
`;
