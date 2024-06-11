/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { Stepper as StepperBase } from '@mui/material';
import { Button as ButtonBase } from '@controls/button';
import styled from 'styled-components';

export const Stepper = styled(StepperBase)`
	border-radius: 0;
	box-shadow: none;
`;

export const Container = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	background-color: ${({ theme }) => theme.palette.secondary.main};
`;

export const ButtonsContainer = styled.div`
	display: grid;
	place-content: center;
	grid-template-columns: repeat(3, 1fr);
`;

export const Button = styled(ButtonBase).attrs({
	variant: 'outlined',
})``;