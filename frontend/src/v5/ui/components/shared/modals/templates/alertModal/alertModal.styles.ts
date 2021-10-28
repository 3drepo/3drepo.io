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

export const Line = styled.hr`
	border: 0;
	border-bottom: 1px solid ${({ theme }) => theme.palette.base.lightest};
	width: calc(100% - 100px);
	margin-top: 28px;
	margin-bottom: 11px;
`;

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	min-width: 633px;
	min-height: 295px;
	padding-top: 43px;
`;

export const Actions = styled.div`
	display: flex;
`;

export const Details = styled(Typography).attrs({
	variant: 'body1',
})`
	margin-top: 5px;
	margin-bottom: 25px;
	color: ${({ theme }) => theme.palette.base.main};
`;
