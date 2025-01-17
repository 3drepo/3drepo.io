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
import styled from 'styled-components';
import { Container as ErrorMessage } from '../errorMessage/errorMessage.styles';

export const PostSubmitSuccessfulMessage = styled(ErrorMessage)`
	color: ${({ theme }) => theme.palette.primary.main};
	background-color: ${({ theme }) => theme.palette.primary.lightest};

	h5 {
		font-size: 16px;
	}
`;

export const IconContainer = styled.div`
	display: flex;

	svg {
		border: solid 1px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		padding: 4px;
		margin-top: 1px;
	}
`;
