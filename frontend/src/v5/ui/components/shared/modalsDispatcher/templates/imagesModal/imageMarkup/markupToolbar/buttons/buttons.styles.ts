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

import { FloatingButtonsContainer } from '@/v5/ui/routes/viewer/toolbar/buttons/buttonOptionsContainer/multioptionIcons.styles';
import styled, { css } from 'styled-components';
import { Container } from '../toolbarButton/toolbarButton.styles';

export const IconWithFooterContainer = styled.div<{ $footer }>`
	position: relative;
	height: 16.5px;

	&::after {
		content: "${({ $footer }) => $footer}";
		font-size: 10px;
		font-weight: 600;
		position: absolute;
		bottom: -4px;
		left: 13px;
		height: 10px;
		line-height: 10px;
		background: ${({ theme }) => theme.palette.primary.contrast};
		padding: 0 2px;
	}
`;

export const FloatingOptionsContainer = styled(FloatingButtonsContainer)`
	width: 40px;
	height: 115px;
	padding: 10px 5px;
	box-sizing: border-box;
	border-radius: 20px;
	border: solid 1px ${({ theme }) => theme.palette.base.lightest};
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	bottom: 58px;
`;

export const FloatingOption = styled.div`
	display: grid;
	place-items: center;
	height: 19px;
	cursor: pointer;
	width: 100%;
`;

export const ButtonOptionsContainer = styled.div<{ disabled?: boolean; }> `
	position: relative;

	& > ${ /* sc-selector */Container}::after {
		content: '';
		position: absolute;
		height: 0;
		width: 0;
		top: 6px;
		right: 6px;
		border: solid 3px ${({ theme }) => theme.palette.base.main};
		border-left-color: transparent;
		border-bottom-color: transparent;
	}
`;

