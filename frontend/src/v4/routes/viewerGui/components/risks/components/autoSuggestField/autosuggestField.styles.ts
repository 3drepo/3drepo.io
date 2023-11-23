/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { COLOR } from '../../../../../../styles';

export const Container = styled.div`
	display: contents;
`;

export const Wrapper = styled.div`
	z-index: 12323;

	.react-autosuggest__suggestions-list {
		max-height: 250px;
		overflow: auto;
		padding-left: 0;
		margin: 0;
		box-shadow:
			0 5px 5px -3px rgba(0,0,0,0.2),
			0 8px 10px 1px rgba(0,0,0,0.14),
			0 3px 14px 2px rgba(0,0,0,0.12)
	}

	.react-autosuggest__suggestion {
		list-style: none;
		height: 62px;
		border-bottom: 1px solid ${COLOR.BLACK_6};
		display: flex;
		flex: 1;
		align-items: center;
	}

	.react-autosuggest__suggestion > div {
		flex: 1;
	}
`;
