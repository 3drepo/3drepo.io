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

import styled, { css } from 'styled-components';
import { Button, Breadcrumbs } from '@mui/material';
import { Link, LinkProps } from 'react-router-dom';
import { TextOverflow } from '@controls/textOverflow';
import { FONT_WEIGHT } from '@/v5/ui/themes/theme';

export const Container = styled(Breadcrumbs)`
	&& {
		margin-left: 15px;

		a {
			text-overflow: ellipsis;
			overflow: hidden;
			display: block;
			white-space: nowrap;
		}

		.MuiBreadcrumbs-li {
			max-width: fit-content;
			overflow: hidden;
			margin: 0 4px;

			&:nth-of-type(1) {
				height: 37px;
			}

			&:nth-of-type(3) {
				flex: 3;
			}

			&:nth-of-type(5) {
				flex: 5;
			}

			&:nth-of-type(7) {
				flex: 7;
			}

			&:nth-of-type(9) {
				flex: 9;
			}
		}
	}
`;

const BasicBreadcrumb = styled(Button).attrs({
	variant: 'text',
})`
	&& {
		color: ${({ theme }) => theme.palette.primary.contrast};
		padding: 5px;
		margin: 0;
		min-width: auto;
		height: 31px;

		&:hover {
			text-decoration: none;
		}

		&.MuiButton-text.Mui-focusVisible {
			background-color: ${({ theme }) => theme.palette.secondary.mid};
		}
	}
`;


export const Breadcrumb = styled(BasicBreadcrumb).attrs({
	component: Link,
})<LinkProps>``;

export const InteractiveBreadcrumb = styled(BasicBreadcrumb)<{ $secondary: boolean }>`
	&& {
		${({ theme }) => theme.typography.h3};
		color: ${({ theme }) => theme.palette.primary.main};
		max-width: 100%;
		padding-right: 9px;
		${({ $secondary }) => $secondary && css`
		font-weight: ${FONT_WEIGHT.SLIM}
		`};

		.MuiButton-endIcon {
			margin-top: 1px;
		}
	}
`;

export const HomeIconBreadcrumb = styled(Breadcrumb)<{ $active: boolean; }>`
	&& {
		${({ $active, theme }) => $active && `color: ${theme.palette.primary.main}`};
		padding: 10px;
	}
`;

export const OverflowWrapper = styled(TextOverflow)`
	width: auto;
`;
