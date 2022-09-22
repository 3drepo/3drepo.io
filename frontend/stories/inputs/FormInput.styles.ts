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

export const FormContainer = styled.form`
	margin: auto;
	width: 300px;
	padding: 20px;
	border-radius: 10px;
	box-shadow: 0px 12px 33px 0px ${({ theme }) => theme.palette.tertiary.lightest};
	border: solid 30px ${({ theme }) => theme.palette.secondary.dark};
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	display: flex;
	flex-direction: column;
`;

export const FormData = styled.div`
	margin-top: 30px;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
	width: 100%;
    word-break: break-all;
	${({ theme }) => theme.typography.body1}
`;
