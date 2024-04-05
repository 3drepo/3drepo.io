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

import styled from 'styled-components';
import { DrawingsCalibrationButton as DrawingsCalibrationButtonBase } from '@/v5/ui/routes/dashboard/projects/drawings/drawingsList/drawingsListItem/drawingsCalibrationButton/drawingsCalibrationButton.styles';
import { CalibrationStates } from '@/v5/store/drawings/drawings.types';

export const Id = styled.div`
	color: ${({ theme }) => theme.palette.base.main};
	font-weight: 500;
	font-size: 10px;
	line-height: 14px;
`;

export const Title = styled.div`
	color: ${({ theme }) => theme.palette.secondary.main};
	font-weight: 500;
	font-size: 12px;
	line-height: 16px;
	padding-top: 5px;
	width: fit-content;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;

	&:hover {
		text-decoration: underline;
	}
`;

// TODO - fix after new palette is released
export const Drawing = styled.div<{ $selected?: boolean }>`
	position: relative;
	cursor: pointer;
	padding: 12px 14px 16px;
	background-color: ${({ theme, $selected }) => ($selected ? '#edf0f8' : theme.palette.primary.contrast)};
`;

export const DrawingsCalibrationButton = styled(DrawingsCalibrationButtonBase)<{ calibration: CalibrationStates, tooltipTitle }>`
	.MuiButton-root {
		border-radius: 4px;
		border: solid 1px currentColor;
		width: 103px;
		height: 24px;
	}
`;

export const FlexContainer = styled.div`
	display: flex;
	flex-direction: row;
	gap: 10px;
`;

export const ImageContainer = styled.div`
	border-radius: 5px;
	border: solid 1px ${({ theme }) => theme.palette.base.lightest};
	box-sizing: border-box;
	height: 75px;
	width: 75px;
`;
