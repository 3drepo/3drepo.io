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

export const Spinner = styled.div<{ borderSize?: number }>`
	border: ${({ borderSize = 2, theme }) => `${borderSize}px solid ${theme.palette.secondary.light}`};
	border-top: ${({ borderSize = 2, theme }) => `${borderSize}px solid ${theme.palette.primary.main}`};
	border-radius: 50%;
	width: 12px;
	height: 12px;
	animation: spin 1.2s cubic-bezier(0.770, 0.000, 0.175, 1.000) infinite;

	@keyframes spin {
		0% {
			transform: rotate(45deg);
		}
		100% {
			transform: rotate(405deg);
		}
	}
`;
