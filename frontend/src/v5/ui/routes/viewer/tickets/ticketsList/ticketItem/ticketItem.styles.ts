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

import { CreationInfo as BaseCreationInfo } from '@components/shared/creationInfo/creationInfo.component';
import { CreationInfoValue } from '@components/shared/creationInfo/creationInfo.styles';
import { ControlledAssigneesSelect } from '@controls/assigneesSelect/controlledAssigneesSelect.component';
import styled, { css } from 'styled-components';
import ViewpointIconBase from '@assets/icons/outlined/cube_in_square-outlined.svg';
import { TextOverflow } from '@controls/textOverflow';

export const Title = styled(TextOverflow)`
	color: ${({ theme }) => theme.palette.secondary.main};
	font-weight: 500;
	font-size: 12px;
	line-height: 12px;
	height: 12px;
	padding: 8px 0;
	width: fit-content;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const TicketItemContainer = styled.div<{ $selected?: boolean }>`
	display: flex;
	flex-flow: column;
	cursor: pointer;
	padding: 10px;
	gap: 10px;
	background-color: ${({ theme, $selected }) => ($selected ? theme.palette.primary.lightest : theme.palette.primary.contrast)};
	${({ theme, $selected }) => $selected && css`
		background-color: ${theme.palette.primary.lightest};
		${Title} {
			color: ${theme.palette.primary.dark}
		}
	`}
`;

export const FlexRow = styled.div`
	display: inline-flex;
	gap: 7px;
	width: 100%;
`;

export const BaseInfoContainer = styled.div`
	min-width: 0;
`;

export const IssuePropertiesRow = styled(FlexRow)`
	align-items: center;
	gap: 0;
`;

export const Id = styled.div`
	color: ${({ theme }) => theme.palette.base.main};
	${({ theme }) => theme.typography.caption}
	line-height: 10px;
`;

// TODO - fix after new palette is released
export const Description = styled(TextOverflow).attrs({
	lines: 2,
})`
	${({ theme }) => theme.typography.label};
	line-height: 11px;
	color: #20232A;
`;

export const ThumbnailContainer = styled.div`
	position: relative;
	height: 75px;
	width: 75px;
	min-width: 75px;
	box-sizing: border-box;
	border: 1px solid ${({ theme }) => theme.palette.base.lightest};
	border-radius: 5px;
	overflow: hidden;
`;

export const HoverState = styled.div`
	background-color: ${({ theme }) => theme.palette.secondary.main};
	position: absolute;
	width: 100%;
	height: 100%;
	z-index: 101;
	opacity: 0;
	&:hover {
		opacity: 0.75;
	}
`;

export const ViewpointIcon = styled(ViewpointIconBase)`
	position: absolute;
	color: ${({ theme }) => theme.palette.primary.contrast};
	height: 18px;
	width: 18px;
	top: 8px;
	left: 8px;
`;

export const Thumbnail = styled.img`
	height: 100%;
	width: 100%;
	object-fit: cover;
	user-select: none;
`;

export const ImagePlaceholder = styled.div`
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	${({ theme }) => theme.typography.label};
	color: ${({ theme }) => theme.palette.base.main};
	display: flex;
    flex-flow: column;
    align-items: center;
    text-align: center;
	height: 100%;
    justify-content: center;
	gap: 4px;
	line-height: 12px;
`;

export const Assignees = styled(ControlledAssigneesSelect).attrs({
	maxItems: 5,
	showEmptyText: true,
	multiple: true,
})`
	margin-left: auto;
	height: 28px;
`;

export const CreationInfo = styled(BaseCreationInfo)`
	line-height: 10px;
	padding-bottom: 5px;
	color: ${({ theme }) => theme.palette.base.main};
	${CreationInfoValue} {
		color: ${({ theme }) => theme.palette.secondary.main};
		text-decoration: none;
	}
`;
