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
import { Button, Breadcrumbs } from '@material-ui/core';

export const Container = styled(Breadcrumbs)`
	&& {
		margin-left: 15px;
	}
`;

export const InteractiveBreadcrumb = styled(Button).attrs({
	variant: 'text',
})`
	&& {
		${({ theme }) => theme.typography.body1};
		color: ${({ theme }) => theme.palette.primary.main};
		padding: 5px;
		margin: 0;

		&:hover {
			text-decoration: none;
		}
	}
`;

export const Breadcrumb = styled(Button).attrs({
	variant: 'text',
})`
	&& {
		color: ${({ theme }) => theme.palette.base.main};
	
		&:hover {
			text-decoration: none;
		}
	}
`;
