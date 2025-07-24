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

export const Container = styled.div`
	height: 100%;
	overflow: overlay;
`;

export const LegalContent = styled.div`
	width: 90%;
	max-width: 800px;
	margin: 70px auto;
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
		margin-top: 35px;
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
		padding-left: 21px;
		color: ${({ theme }) => theme.palette.base.main};
		li {
			${({ theme }) => theme.typography.h2};
			&::marker {
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
		margin: 35px 0;
		width: 100%;
		border-collapse: collapse;
		td {
			padding: 10px;
			font-weight: 400;
			display: table-cell;
			vertical-align: top;
			ol {
				color: inherit;
				padding: 0 20px;
				li {
					${({ theme }) => theme.typography.h5}
					font-weight: 400;
				}
				li::marker {
					color: inherit;
				}
			}
			p {
				margin: 0;
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

export const TermsForm = styled.div`
	margin: 30px;
`;

export const Clause = styled.div`
	margin: 1px;
	display: inline-flex;
`;

export const ClauseNo = styled.span`
	margin: 13px 10px 13px 0;
`;

export const PaperTitle = styled.div`
	color: ${({ theme }) => theme.palette.secondary.main};
	font-size: 32px;
	font-weight: ${FONT_WEIGHT.MEDIUM};
	line-height: 1em;
	margin-bottom: 20px;
`;

export const SupportEmail = styled.a.attrs({
	href: 'mailto:support@3drepo.com',
})`
	&::after {
		content: 'support@3drepo.com';
	}
`;
