/**
 *  Copyright (C) 2023 3D Repo Ltd
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

const selectedStyles = css`
	color: ${({ theme }) => theme.palette.primary.main};
	.highlight {
		color: ${({ theme }) => theme.palette.primary.darkest};
	}
`;

const disabledStyles = css`
	color: ${({ theme }) => theme.palette.base.main};

	.highlight {
		color: ${({ theme }) => theme.palette.base.main};
	}
`;

export const ViewerIconContainer = styled.div<{ selected?: boolean, disabled?: boolean }>`
	svg {
		height: 18px;
		width: 18px;
	}
	
	color: ${({ theme }) => theme.palette.secondary.lightest};
	.highlight {
		color: ${({ theme }) => theme.palette.base.light};
	}

	${({ selected }) => selected && selectedStyles}
	&:hover {
		${selectedStyles}
	}

	&, &:hover {
		${({ disabled }) => disabled && disabledStyles}
	}

	& * {
		transition: color .1s;
	}
`;
