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
import TextField from '@material-ui/core/TextField';
import Popper from '@material-ui/core/Popper';
import { COLOR } from './../../../styles/colors';

export const Container = styled.div``;

export const StyledTextField = styled(TextField)`
  margin: 8px 0;
`;

export const SuggestionsList = styled(Popper)`
	z-index: 1;
	margin-top: -15px;

	.react-autosuggest__suggestions-list {
		max-height: 250px;
		overflow: auto;
		padding-left: 0;
	}

	.react-autosuggest__suggestion {
		list-style: none;
		height: 44px;
		border-bottom: 1px solid ${COLOR.BLACK_6};
		display: flex;
		flex: 1;
		align-items: center;
	}

	.react-autosuggest__suggestion > div {
		font-size: 12px;
		flex: 1;
  }
`;
