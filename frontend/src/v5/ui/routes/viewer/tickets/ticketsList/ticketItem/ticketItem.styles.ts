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
import styled from 'styled-components';

export const TicketItemContainer = styled.div<{ $selected?: boolean }>`
	display: flex;
	flex-flow: column;
	cursor: pointer;
	padding: 10px;
	gap: 10px;
	background-color: ${({ theme, $selected }) => ($selected ? theme.palette.primary.lightest : theme.palette.primary.contrast)};
`;

export const FlexRow = styled.div`
	display: inline-flex;
	gap: 7px;
	width: 100%;
`;

export const IssuePropertiesRow = styled(FlexRow)`
	align-items: center;
`;

export const Id = styled.div`
	color: ${({ theme }) => theme.palette.base.main};
	${({ theme }) => theme.typography.caption}
	line-height: 10px;
`;

export const Title = styled.div`
	color: ${({ theme }) => theme.palette.secondary.main};
	font-weight: 500;
	font-size: 12px;
	line-height: 12px;
	padding: 8px 0;
	width: fit-content;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;

	&:hover {
		text-decoration: underline;
	}
`;

// TODO - fix after new palette is released
export const Description = styled.div`
	${({ theme }) => theme.typography.label};
	line-height: 11px;
	color: #20232A;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;

	@supports (-webkit-line-clamp: 2) {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: initial;
		/* stylelint-disable-next-line */
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
`;

export const Thumbnail = styled.img`
	height: 75px;
	width: 75px;
	min-width: 75px;
	box-sizing: border-box;
	border: 1px solid ${({ theme }) => theme.palette.base.lightest};
	border-radius: 5px;
	object-fit: cover;
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
