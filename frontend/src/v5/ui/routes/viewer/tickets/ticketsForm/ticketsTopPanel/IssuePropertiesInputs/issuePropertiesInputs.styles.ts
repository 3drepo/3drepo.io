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
import { InputContainer } from '@controls/inputs/inputContainer/inputContainer.styles';

export const Container = styled.div``;

export const FlexContainer = styled(InputContainer)`
	display: flex;
	flex-direction: row;

	& > *:not(:last-child) {
		border-right: solid 1px ${({ theme }) => theme.palette.base.lightest};
		padding-right: 10px;
	}

	& > *:not(:first-child) {
		padding-left: 10px;
	}
`;

export const Property = styled.div`
	.MuiChip-root {
		padding: 0;
	}
`;

export const PriorityInput = styled(Property)`
	flex: 65;
`;

export const DueDateInput = styled(Property)`
	flex: 125;
`;

export const StatusInput = styled(Property)`
	flex: 110;
`;

export const PropertyTitle = styled.div`
	${({ theme }) => theme.typography.kicker};
	color: ${({ theme }) => theme.palette.base.main};
`;

export const AssigneesContainer = styled(InputContainer)`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	
	&:not(:last-child) {
		margin-bottom: 10px;
	}
`;
