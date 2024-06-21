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

import { StepConnector, Stepper as StepperBase } from '@mui/material';
import { Button } from '@controls/button';
import styled from 'styled-components';
import { Link as LinkBase } from 'react-router-dom';

export const StepperWrapper = styled.div`
	width: calc(100% - 295px);
`;

export const Stepper = styled(StepperBase)`
	border-radius: 0;
	box-shadow: none;
	width: 130%;
	margin-left: -15%;

	.MuiStep-root {
		border-bottom: none;

		.MuiStepLabel-label {
			margin: 4px auto 0;
			max-width: 63%;
			${({ theme }) => theme.typography.label}

			&, &.Mui-active, &.Mui-completed, &.Mui-disabled {
				color: ${({ theme }) => theme.palette.primary.contrast};
			}
		}

		.MuiStepLabel-iconContainer {
			width: 24px;
			height: 24px;
			border-radius: 24px;
			display: flex;
			justify-content: center;
			align-items: center;
			position: relative;
			z-index: 1;

			&.Mui-completed {
				background-color: ${({ theme }) => theme.palette.primary.main};
				color: ${({ theme }) => theme.palette.primary.contrast};
			}
			&.Mui-active {
				background-color: ${({ theme }) => theme.palette.primary.lightest};
				color: ${({ theme }) => theme.palette.primary.main};
				border: solid 2px currentColor;
				box-sizing: border-box;
			}
			&.Mui-disabled {
				background-color: ${({ theme }) => theme.palette.primary.contrast};
				color: ${({ theme }) => theme.palette.secondary.main};
			}
		}
	}
`;

export const Connector = styled(StepConnector)`
	&.MuiStepConnector-root {
		display: unset;
		top: 20.5px;
		left: calc(-50% + 11px);
		right: calc(50% + 11px);
	}

	.MuiStepConnector-line {
		height: 3px;
		border: 0;
		background-color: ${({ theme }) => theme.palette.primary.main};
	}

	&.Mui-disabled .MuiStepConnector-line {
		background-color: ${({ theme }) => theme.palette.primary.contrast};
	}
`;

export const Container = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	height: 58px;
	background-image: ${({ theme }) => theme.palette.gradient.secondary};
`;

export const ButtonsContainer = styled.div`
	display: grid;
	place-content: center;
	grid-auto-flow: column;

	button {
		margin-left: 0;
	}
`;

export const ContrastButton = styled(Button).attrs({
	variant: 'outlined',
	color: 'secondary',
})`
	background: transparent;
	color: ${({ theme }) => theme.palette.primary.contrast};
	border-color: ${({ theme }) => theme.palette.base.light};

	&:hover, &.Mui-focusVisible {
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		color: ${({ theme }) => theme.palette.secondary.main};
	}

	&.Mui-disabled {
		color: ${({ theme }) => theme.palette.primary.contrast};
		background-color: ${({ theme }) => theme.palette.base.lightest};
	}
`;

export const PrimaryButton = styled(Button).attrs({
	variant: 'contained',
	color: 'primary',
})``;

export const Link = styled(LinkBase)`
	text-decoration: none;
`;
