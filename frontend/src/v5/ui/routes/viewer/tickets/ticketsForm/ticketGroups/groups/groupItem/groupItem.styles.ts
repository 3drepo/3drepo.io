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

import { GroupIcon } from '@/v5/ui/routes/viewer/groups/groupItem/groupIcon/groupIcon.styles';
import { Typography } from '@controls/typography';
import styled, { css } from 'styled-components';

export const GroupStyling = css`
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

export const Buttons = styled.div`
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

export const Container = styled.div`
	${GroupStyling}
	flex-direction: row;
	margin-bottom: 4px;

	&:not(:hover) ${Buttons} {
		width: 0;
		overflow: hidden;
	}

	${GroupIcon} {
		border-color: ${({ theme }) => theme.palette.secondary.lightest};
	}
`;

export const Headline = styled.span`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	width: calc(100% - 34px);
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
