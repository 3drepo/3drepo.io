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

import { FONT_WEIGHT } from '@/v4/styles';
import styled from 'styled-components';
import { Link as LinkBase } from 'react-router-dom';
import { Container as ContainerBase } from '../userSignup.styles';
import { LoginPrompt, Title } from '../userSignupForm/userSignupForm.styles';

export const Container = styled(ContainerBase)`
	padding:50px 65px;
	box-sizing: content-box;

	${LoginPrompt} {
		margin-top:15px;
	}

	${Title} {
		margin-bottom: 15px;
		font-weight: ${FONT_WEIGHT.BOLDER};
	}

	width: 408px;
`;

export const Link = styled(LinkBase)`
	width: 100%;
`;
