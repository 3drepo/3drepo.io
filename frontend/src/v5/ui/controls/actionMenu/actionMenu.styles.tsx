/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { Paper as PaperBase } from '@mui/material';

export const ActionMenuSection = styled.div`
	display: flex;
	flex-direction: column;
	padding: 11px;

	&:not(:last-of-type) {
		border-bottom: 1px solid ${({ theme }) => theme.palette.base.lightest};
	}
`;

export const ActionMenuTriggerButton = styled.div.attrs({
	isActionMenuTriggerButton: true,
})``;

export const Paper = styled(PaperBase)`
	border-radius: 5px;
	box-shadow: 
		0 6px 10px rgb(0 0 0 / 14%),
		0 1px 18px rgb(0 0 0 / 12%),
		0 3px 5px rgb(0 0 0 / 20%);
`;

export const Menu = styled.div`
	display: flex;
	flex-direction: column;
	width: 230px;
`;
