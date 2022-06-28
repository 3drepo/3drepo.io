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

import { FONT_WEIGHT } from '@/v5/ui/themes/theme';
import styled from 'styled-components';

export const LegalContent = styled.div`
	width: 90%;
	max-width: 800px;
	margin: 70px auto;
	${({ theme }) => theme.typography.fontFamily};
	color: ${({ theme }) => theme.palette.base.main};

	/* Typography */
	p {
		${({ theme }) => theme.typography.h5};
		font-weight: ${FONT_WEIGHT.REGULAR};
	}
	h1 {
		${({ theme }) => theme.typography.h1}
	}
	h2 {
		${({ theme }) => theme.typography.h2}
	}
	h3 {
		${({ theme }) => theme.typography.h3}
	}
	strong, h1, h2, h3 {
		color: ${({ theme }) => theme.palette.secondary.main};
		font-weight: ${FONT_WEIGHT.MEDIUM};
	}
	a {
		color: ${({ theme }) => theme.palette.primary.main};
	}
	/* Lists */
	ol {
		padding: 0;
		color: ${({ theme }) => theme.palette.base.main};
		li {
			${({ theme }) => theme.typography.h2};
			&::marker {
				font-weight: bold;
				color: ${({ theme }) => theme.palette.secondary.main};
			}
			li {
				${({ theme }) => theme.typography.h5};
				&::marker {
					color: ${({ theme }) => theme.palette.base.main};
				}
			}
		}
	}
	
	/* Tables */
	table, td {
		border: 1px solid ${({ theme }) => theme.palette.base.lightest};
		border-spacing: 0;
	}
	table {
		padding: 0;
		td {
			padding: 10px;
			font-weight: 400;
			ol {
				color: inherit;
				padding: 10px 20px;
				li {
					${({ theme }) => theme.typography.h5}
					font-weight: 400;
				}
				li::marker {
					color: inherit;
				}
			}
		}
		tr td:first-child {
			${({ theme }) => theme.typography.h5}
			color: ${({ theme }) => theme.palette.secondary.main};
		}
	}
`;

export const Indent = styled.div`
	margin-left: 15px;
`;

export const TermsForm = styled.div``;

export const ListItem = styled.span`
	margin-right: 10px;
`;

export const PaperTitle = styled.div`
	${({ theme }) => theme.typography.fontStyle}
	color: ${({ theme }) => theme.palette.secondary.main};
	font-size: 32px;
	font-weight: ${FONT_WEIGHT.MEDIUM};
	line-height: 1em;
	margin-bottom: 20px;
`;

export const SupportEmail = styled.a.attrs({
	href: 'mailto:support@3drepo.org',
})`
	::after {
		content: 'support@3drepo.org';
	}
`;
