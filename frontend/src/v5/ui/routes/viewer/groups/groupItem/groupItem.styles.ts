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
import { StyledIconButton } from '@/v4/routes/teamspaces/components/tooltipButton/tooltipButton.styles';
import styled, { css } from 'styled-components';

export const GroupsTreeListItem = styled.li<{ $highlighted?: boolean }>`
	background-color: ${({ $highlighted, theme: { palette } }) => {
		return $highlighted ? palette.base.lightest : palette.primary.contrast;
	}};
	cursor: default;
	position: relative;
`;

export const Separator = styled.hr``;

export const GroupsTreeListItemContainer = styled.div<{ $depth }>`
	padding-left: ${({ $depth }) => $depth * 10}px;
	min-height: 41px;
	align-items: center;
	display: flex;
	overflow: hidden;
	box-sizing: border-box;
	max-width: 311px;

	~ ${Separator} {
		border: solid 0 ${({ theme: { palette } }) => palette.base.lightest};
	}

	~ ${Separator} {
		margin: 0;
		border-bottom-width: 1px;
	}
`;

export const ButtonsContainer = styled.div`
	position: absolute;
	right: 30px;
	color: #DCDCDC;
	${StyledIconButton} {
		right: -10px;
	}
`;

export const GroupItemTextContainer = styled.div`
	padding-left: 10px;
	display: inline-flex;
	flex-direction: column;
	max-width: 100%;
	overflow: hidden;
`;

export const GroupItemObjects = css`
	${({ theme }) => theme.typography.caption};
	color: ${({ theme }) => theme.palette.base.main};
`;

export const GroupItemName = styled.div`
	${({ theme }) => theme.typography.body1};
	color: ${({ theme }) => theme.palette.secondary.main};
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
`;

