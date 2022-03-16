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
import IncludeIconBase from '@assets/icons/include_element.svg';
import RemoveIconBase from '@assets/icons/remove_element.svg';

export const IconContainer = styled.div`
	display: grid;
	min-width: 46px;
`;

export const IncludeIcon = styled(IncludeIconBase)`
	&:hover {
		circle {
			fill: ${({ theme }) =>
		theme.palette.primary.dark};
		}
	}

	&:active {
		circle {
			fill: ${({ theme }) =>
		theme.palette.primary.darkest};
		}
	}

	${({ theme, isSelected }) =>
		isSelected && `
		circle {
			fill: ${theme.palette.primary.lightest};
		}
		path {
			fill: ${theme.palette.primary.dark};
		}

		&:hover {
			circle {
				fill: ${theme.palette.primary.dark};
			}
			path {
				fill: ${theme.palette.primary.lightest};
			}
		}

		&:active {
			circle {
				fill: ${theme.palette.primary.darkest};
			}
			path {
				fill: ${theme.palette.primary.lightest};
			}
		}
	`}
`;

export const RemoveIcon = styled(RemoveIconBase)`
	&:hover {
		circle {
			fill: ${({ theme }) =>
		theme.palette.error.dark};
		}
	}

	&:active {
		circle {
			fill: ${({ theme }) =>
		theme.palette.error.darkest};
		}
	}
`;
