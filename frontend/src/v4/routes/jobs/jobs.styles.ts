/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { DashedContainer } from '@controls/dashedContainer/dashedContainer.component';
import styled from 'styled-components';
import { ColorSelect } from '../components/colorPicker/colorPicker.styles';

export const Container = styled.div `
	height: 100%;

	${ColorSelect} {
		border: none;
	}
`;

export const NewJobBottomButton = styled(DashedContainer)`
	padding: 23px 0;
	color: ${({ theme }) => theme.palette.primary.main};
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 15px;
	${({ theme }) => theme.typography.h5}
	cursor: pointer;

	&:hover {
		color: ${({ theme }) => theme.palette.primary.dark};
	}

	svg {
		width: 34px;
		height: 34px;
		margin-right: 3px;
	}
`;
