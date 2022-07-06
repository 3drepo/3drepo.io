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

import styled from 'styled-components';
import { Typography } from '@controls/typography';

export const ModalContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	min-width: 633px;
	padding: 43px 0 25px;
`;

export const Actions = styled.div`
	display: flex;
`;

export const Details = styled(Typography).attrs({
	variant: 'body1',
})`
	margin-top: 5px;
	color: ${({ theme }) => theme.palette.base.main};
`;

export const Status = styled(Typography).attrs({
	variant: 'h5',
	component: 'p',
})`
	text-align: center;
	margin-top: 8px;
	margin-bottom: 0;
	color: ${({ theme }) => theme.palette.base.main};
`;
