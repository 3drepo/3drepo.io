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
import CheckIcon from '@assets/icons/check.svg';
import ErrorIcon from '@assets/icons/stepper_error.svg';

export const StepIconContainer = styled.div`
	border-radius: 50%;
	padding: 5px;
	width: 22px;
	height: 22px;
	background-color: currentColor;
	font-family: ${({ theme }) => theme.typography.fontFamily};
	font-size: 11px;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;

	& > * {
		color: ${({ theme }) => theme.palette.primary.contrast};
	}
`;

export const CompletedStepIcon = styled(CheckIcon)``;

export const ErrorStepIcon = styled(ErrorIcon)`
	width: 22px;
	height: 22px;
	padding: 5px;
	border-radius: 50%;
	box-sizing: border-box;
	overflow: visible;
	background-color: ${({ theme }) => theme.palette.error.main};
	& path {
		fill: ${({ theme }) => theme.palette.primary.contrast};
	}
`;
