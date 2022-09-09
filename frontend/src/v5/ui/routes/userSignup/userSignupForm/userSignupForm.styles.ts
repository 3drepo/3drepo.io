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
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';
import StepperBase from '@mui/material/Stepper';
import StepLabelBase from '@mui/material/StepLabel';
import { clientConfigService } from '@/v4/services/clientConfig';

export const MainContentStyling = css`
	margin: 28px;
	width: 454px;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	border-radius: 6px;
	box-sizing: border-box;
	/* TODO - fix after new design will be released */
	box-shadow: ${clientConfigService.getCustomBackgroundImagePath() ? '0px 8px 15px -3px #878787' : '0 1px 1px rgb(0 0 0 / 14%)'};
`;

export const Container = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

export const Title = styled.div`
	${({ theme }) => theme.typography.h1};
	color: ${({ theme }) => theme.palette.secondary.main};
`;

export const Underlined = styled.div`
	display: inline-block;
	text-decoration: underline;
	text-underline-offset: 3px;
`;

export const Stepper = styled(StepperBase)`
	${MainContentStyling}
`;

export const StepLabel = styled(StepLabelBase)<{ $reachable?: boolean }>`
	${({ $reachable }) => $reachable && `
		&& {
			cursor: pointer;
		}
	`}

	.MuiStepLabel-label {
		font-size: 15px;
		font-weight: 600;
	}
`;

export const LoginPrompt = styled.div`
	${({ theme }) => theme.typography.link};
	color: ${({ theme }) => theme.palette.base.main};
	font-family: ${({ theme }) => theme.typography.fontFamily};
	text-decoration: none;
	font-weight: 400;
`;

export const LoginPromptLink = styled(Link)`
	&& {
		color: ${({ theme }) => theme.palette.primary.main};
		text-decoration: none;
		margin-left: 7px;
	}
`;
