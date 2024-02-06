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

import { Truncate } from '@/v4/routes/components/truncate/truncate.component';
import { CreationInfo as BaseCreationInfo } from '@components/shared/creationInfo/creationInfo.component';
import { CreationInfoValue } from '@components/shared/creationInfo/creationInfo.styles';
import { ControlledAssigneesSelect } from '@controls/assigneesSelect/controlledAssigneesSelect.component';
import styled from 'styled-components';

export const Ticket = styled.div<{ $selected?: boolean }>`
	position: relative;
	cursor: pointer;
	padding: 5px 10px;
	background-color: ${({ theme, $selected }) => ($selected ? theme.palette.primary.lightest : theme.palette.primary.contrast)};
`;

export const FlexRow = styled.div`
	display: inline-flex;
	gap: 7px;
	margin: 5px 0;
	width: 100%;
`;

export const IssuePropertiesRow = styled(FlexRow)`
	align-items: center;
`;

export const Id = styled.div`
	color: ${({ theme }) => theme.palette.base.main};
	${({ theme }) => theme.typography.caption}
`;

export const Title = styled.div`
	color: ${({ theme }) => theme.palette.secondary.main};
	font-weight: 500;
	font-size: 12px;
	line-height: 16px;
	padding-top: 5px;
	width: fit-content;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;

	&:hover {
		text-decoration: underline;
	}
`;

export const Description = styled(Truncate).attrs({
	lines: 2,
})`
	${({ theme }) => theme.typography.label};
	color: '#20232A';
`;

export const Thumbnail = styled.img`
	height: 75px;
	width: 75px;
	border: 1px solid ${({ theme }) => theme.palette.base.lightest};
	border-radius: 5px;
	object-fit: cover;
`;

export const Assignees = styled(ControlledAssigneesSelect).attrs({
	maxItems: 7,
	showEmptyText: true,
	multiple: true,
})`
	margin-left: auto;
	height: 28px;
`;

export const CreationInfo = styled(BaseCreationInfo)`
	color: ${({ theme }) => theme.palette.base.main};
	${CreationInfoValue} {
		color: ${({ theme }) => theme.palette.secondary.main};
		text-decoration: none;
	}
`;
