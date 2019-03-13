/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import IconButton from '@material-ui/core/IconButton';
import Select from '@material-ui/core/Select';
import MapIcon from '@material-ui/icons/Map';

import { COLOR } from './../../../../styles/colors';

export const StyledSelect = styled(Select)`
	margin-bottom: 12px;

	&& {
		width: 100%;

		[role="button"] {
			padding: 16px 0;
			color: ${COLOR.BLACK};
		}
	}
`;

export const StyledMapIcon = styled(MapIcon)`
	&& {
		color: ${COLOR.BLACK_60};
	}
`;

export const VisibilityButton = styled(IconButton)`
	&& {
		color: '${COLOR.BLACK_60}';
		position: absolute;
		right: -12px;
	}
`;

export const MapLayer = styled.div`
	width: 100%;
	display: flex;
	align-items: center;
	padding: 12px 0;
	justify-content: space-between;
	position: relative;

	:last-child {
		padding-bottom: 0;
	}
`;

export const MapNameWrapper = styled.div`
	display: flex;
	align-items: center;
	font-size: 14px;
	color: ${COLOR.BLACK_60};
`;

export const MapName = styled.div`
	margin-left: 24px;
`;
