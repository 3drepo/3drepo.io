/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { Typography } from '@mui/material';
import { Button } from '@controls/button';

export const Container = styled.ul`
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	width: calc(100% - 150px);
	flex-direction: column;
	display: flex;
	justify-content: flex-start;
	padding: 17px 30px 41px;
	margin: 32px 75px;
	border-radius: 10px;
	box-sizing: border-box;
`;

export const Header = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	width: 100%;
`;

export const Title = styled(Typography).attrs({
	variant: 'h2',
})``;

export const ActionComponents = styled.div`
	display: flex;
	flex-direction: row;
`;

export const NewProjectButton = styled(Button).attrs({
	color: 'primary',
	variant: 'contained'
})``;
