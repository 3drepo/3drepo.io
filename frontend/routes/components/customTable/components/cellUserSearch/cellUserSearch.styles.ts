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

import TextField from '@material-ui/core/TextField';
import Search from '@material-ui/icons/Search';
import styled from 'styled-components';

import { COLOR, FONT_WEIGHT } from '../../../../../styles';

export const SearchIcon = styled(Search)`
	&& {
		font-size: 14px;
		font-weight: ${FONT_WEIGHT.SEMIBOLD};
		color: ${COLOR.BLACK_60};
		margin-right: 8px;
	}
`;

export const SearchField = styled(TextField).attrs({
	InputLabelProps: {
		classes: {
			root: 'search-field__label'
		}
	}
})`
	&& {
		margin: 0;
	}

	label, input {
		font-size: 14px;
		font-weight: ${FONT_WEIGHT.SEMIBOLD};
		color: ${COLOR.BLACK_60};
	}

	input {
		padding: 5px 0;
	}

	.search-field__label {
		margin-top: 3px;
		transform: translate(0, 5px) scale(1);

		&[data-shrink='true'] {
			transform: translate(0, -8px) scale(0.75) !important;
		}
	}

	.search-field__label ~ div {
		margin-top: 5px;
	}

	.search-field__label[data-shrink='false'] ~ div {
		&:before, &:after {
			opacity: 1;
			transform: opacity 200ms ease-in-out;
		}

		&:not(:hover):before {
			opacity: 0;
		}
	}
`;
