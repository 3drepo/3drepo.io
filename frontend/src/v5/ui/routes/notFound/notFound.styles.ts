/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { Typography } from '@controls/typography';
import styled from 'styled-components';

export const Container = styled.div`
	display: flex;
	flex-grow: 1;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 100%;
`;

export const WrapperContainer = styled.div``;

export const Title = styled(Typography).attrs({
	variant: 'h1',
	component: 'h2',
	color: 'secondary',
})`
	margin-top: 50px;
`;

export const Message = styled(Typography).attrs({
	variant: 'h4',
	component: 'span',
})`
	color: ${({ theme }) => theme.palette.base.main};
	margin-top: 25px;
`;

export const ButtonsContainer = styled.div`
	display: flex;
	margin-top: 30px;
`;
