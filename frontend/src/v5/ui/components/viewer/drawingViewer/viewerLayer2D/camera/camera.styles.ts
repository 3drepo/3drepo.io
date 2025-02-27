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
import CameraSVG from '@assets/icons/viewer/camera.svg';
import CameraOffSightSVG from '@assets/icons/viewer/camera_off_sight.svg';
import styled from 'styled-components';

export const CameraIcon = styled(CameraSVG)`
	color: ${({ theme }) => theme.palette.primary.main};
	overflow: unset;
	transform-origin: 0 0;
	cursor: grab; 
	pointer-events: none;

	& > * {
		pointer-events: all;
	}
`;


export const CameraOffSightIcon = styled(CameraOffSightSVG)`
	color: ${({ theme }) => theme.palette.primary.main};
	transform-origin: 0 0;
`;


export const CameraOffSightContainer = styled.div`
	width: 56px;
	height: 56px;
	position: absolute;
	cursor: grab; 
`;