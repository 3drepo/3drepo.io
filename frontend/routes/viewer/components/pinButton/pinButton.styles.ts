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
import Place from '@material-ui/icons/Place';
import { Button } from '@material-ui/core';
import { COLOR } from '../../../../styles';

export const PinIcon = styled(Place).attrs({
	classes: {
		colorSecondary: 'secondary',
		colorPrimary: 'primary',
		colorDisabled: 'disabled'
	}
})`
	&& {
		&.secondary {
			color: ${COLOR.SUNGLOW};
		}

		&.primary {
			color: ${COLOR.BLACK_54};
		}

		&.disabled {
			color: ${COLOR.BLACK_12};
		}
	}
`;

export const LabelButton = styled(Button).attrs({
	classes: {
		disabled: 'disabled'
	}
})`
	&& {
		width: 76px;
		text-transform: none;
		padding: 0;
		min-height: 26px;
		border-radius: 28px;
		color: ${COLOR.LIGHT_GRAY};
		background-color:  ${COLOR.BLACK_26};

		&.disabled {
			background-color: ${COLOR.BLACK_12};
			color: ${COLOR.BLACK_26};
		}
	}

	&&:hover {
		background-color: rgba(0, 0, 0, 0.36);
	}
`;

export const Container = styled.span`
	display: flex;
	align-items: center;
	height: 100%;
	min-height:40px;
`;
