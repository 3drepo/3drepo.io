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

import styled from 'styled-components';
import { Accordion } from '@controls/accordion/accordion.component';
import { GroupStyling, Headline, Name as NameBase } from './groupItem/groupItem.styles';

export const Buttons = styled.div`
	display: contents;
	visibility: hidden;
`;

export const CollectionAccordion = styled(Accordion)`
	&& {
		border: 0;
		background-color: transparent;
		margin-top: 9px;

		&::after {
			opacity: 1;
		}

		&:last-of-type::after {
			border-bottom-left-radius: 5px;
		}

		.MuiAccordionSummary-root {
			${GroupStyling}
			flex-direction: row-reverse;
			padding-left: 14px;
			&:hover ${Buttons} {
				visibility: visible;
			}
		}

		.MuiAccordionSummary-expandIconWrapper {
			background-color: ${({ theme }) => theme.palette.secondary.main};
			color: ${({ theme }) => theme.palette.primary.contrast};
			border: solid 1px ${({ theme }) => theme.palette.secondary.main};
			border-radius: 50%;
			min-width: 16px;
			min-height: 16px;
			display: flex;
			align-items: center;
			justify-content: center;
			padding-top: 1px;
			box-sizing: border-box;

			svg {
				width: 8px;
				height: 6px;
			}

			&:not(.Mui-expanded) {
				transform: rotate(270deg);
				color: ${({ theme }) => theme.palette.secondary.main};
				background-color: ${({ theme }) => theme.palette.primary.contrast};
			}
		}

		.MuiAccordionDetails-root {
			padding: 9px 0 0 16px;
			overflow: hidden;
		}
	
		.MuiAccordionSummary-content {
			width: 100%;
		}
	}
`;

export const CollectionHeadline = styled(Headline)`
	justify-content: space-between;
`;

export const GroupsContainer = styled.div`
	margin: 0;
	padding-left: 0;
	position: relative;

	& > *:first-child {
		margin-top: 0;
	}
`;

export const Icon = styled.div`
	border-radius: 5px;
`;

export const Name = styled(NameBase)`
	font-weight: 500;
`;
