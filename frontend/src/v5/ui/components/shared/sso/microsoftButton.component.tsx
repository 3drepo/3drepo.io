/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { Button } from '@controls/button';
import MicrosoftIcon from '@assets/icons/thirdParty/microsoft.svg';
import { createElement } from 'react';

export const MicrosoftButton = styled(Button).attrs({
	variant: 'contained',
	color: 'primary',
	startIcon: createElement(MicrosoftIcon),
})`
	display: flex;
	width: fit-content;
	font-weight: 500;
	font-size: 12px;
	padding: 20px;
	margin: 0;
	background-color: #2F2F2F; /* The colour is hardcoded as these are microsoft specs and not part of the theme */

	&:hover, &:active {
		background-color: #2F2F2FF0; 
	}
`;
