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

import { Typography } from '@controls/typography';
import styled, { css } from 'styled-components';
import { Accordion } from '@controls/accordion/accordion.component';
import { GroupIcon } from '../../../groups/groupItem/groupIcon/groupIcon.styles';

const GroupStyling = css`
	border: 0;
	border-radius: 8px;
	height: 42px;
	width: 100%;
	box-sizing: border-box;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	padding: 7px;
	display: flex;
	align-items: center;
`;

export const GroupItemButtons = styled.div`
	margin-left: auto;
	display: flex;
	justify-content: flex-end;
	height: 100%;
`;

export const NameContainer = styled.div`
	display: flex;
	flex-direction: column;
	margin-left: 10px;
	flex-shrink: 2;
	max-width: 100%;
	min-width: 0;
`;

export const GroupItemContainer = styled.div`
	${GroupStyling}
	flex-direction: row;
	margin-bottom: 4px;

	&:not(:hover) ${GroupItemButtons} {
		display: none;
	}

	${/* sc-selector */ GroupIcon}::after {
		border-color: ${({ theme }) => theme.palette.secondary.lightest};
	}
`;

export const GroupCollectionAccordion = styled(Accordion)`
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
		}

		.MuiAccordionSummary-expandIconWrapper {
			background-color: ${({ theme }) => theme.palette.secondary.main};
			color: ${({ theme }) => theme.palette.primary.contrast};
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
			}
		}

		.MuiAccordionDetails-root {
			padding: 9px 0 0 16px;
			overflow: hidden;
		}
	
		.MuiAccordionSummary-content {
			width: 100%;
			overflow: hidden;
		}
	}
`;

export const GroupTitle = styled.span`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	width: calc(100% - 49px);
`;

export const GroupCollectionTitle = styled(GroupTitle)`
	justify-content: space-between;
`;

export const GroupCollectionContainer = styled.div`
	margin: 0;
	padding-left: 0;
	position: relative;
`;

export const Icon = styled.div`
	border-radius: 5px;
`;

export const Name = styled(Typography).attrs({
	variant: 'body1',
})`
	cursor: pointer;
	color: ${({ theme }) => theme.palette.secondary.main};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const GroupsCount = styled(Typography).attrs({
	variant: 'caption',
})`
	color: ${({ theme }) => theme.palette.base.main};
`;
