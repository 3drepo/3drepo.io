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
import { Button, Breadcrumbs } from '@mui/material';
import { Link } from 'react-router-dom';
import { TextOverflow } from '@controls/textOverflow';

export const Container = styled(Breadcrumbs)`
	&& {
		margin-left: 15px;
	}
`;

export const Breadcrumb: typeof Link = styled(Button).attrs({
	variant: 'text',
	component: Link,
})`
	&& {
		color: ${({ theme }) => theme.palette.primary.contrast};
		padding: 5px;
		margin: 0 4px;
		min-width: auto;

		&:hover {
			text-decoration: none;
		}

		&.MuiButton-text.Mui-focusVisible {
			background-color: ${({ theme }) => theme.palette.secondary.mid};
		}
	}
`;

export const InteractiveBreadcrumb = styled(Breadcrumb).attrs({
	variant: 'text',
})`
	&& {
		${({ theme }) => theme.typography.h3};
		color: ${({ theme }) => theme.palette.primary.main};
		max-width: 100%;
		padding-right: 9px;
		margin-right: 0;
	}
`;

export const HomeIconBreadcrumb = styled(Breadcrumb)`
	&& {
		padding: 10px;
	}
`;

export const OverflowWrapper = styled(TextOverflow)`
	width: auto;
`;
