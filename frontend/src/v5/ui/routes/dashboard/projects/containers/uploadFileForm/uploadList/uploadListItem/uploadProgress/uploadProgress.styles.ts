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

export const Container = styled.div`
	width: auto;
	display: inline-flex;
	align-items: center;
`;

export const StatusText = styled(Typography).attrs({
	variant: 'h5',
})`
	width: 112px;
	font-weight: bold;
	user-select: none;
	display: inline-flex;
	&.failure { color: ${({ theme }) => theme.palette.error.main} }
	&.success { color: ${({ theme }) => theme.palette.primary.main} }
	&.uploading { color: ${({ theme }) => theme.palette.tertiary.main} }
	&.waiting { color: ${({ theme }) => theme.palette.base.main} }
	svg { margin: auto; }
`;

export const CompletionMark = styled.div`
	width: 25px;
	margin: auto 10px;
	svg path { stroke: ${({ theme }) => theme.palette.primary.main} }
`;
