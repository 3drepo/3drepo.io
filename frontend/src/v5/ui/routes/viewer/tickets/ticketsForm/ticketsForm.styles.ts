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

import { Gap } from '@controls/gap';
import styled from 'styled-components';

export const ErrorTextGap = styled(Gap)``;

export const PanelsContainer = styled.div`
	.MuiAccordion-root {
		&:first-of-type {
			border-top-left-radius: 6px;
			border-top-right-radius: 6px;
		}

		&:not(:first-of-type) {
			border-top: 0;
		}

		&:last-of-type {
			border-bottom-left-radius: 6px;
			border-bottom-right-radius: 6px;
		}

		.MuiAccordionDetails-root > :not(:first-child) {
			margin-top: 10px;
			&${ErrorTextGap} {
				margin: 0;
			}
		}
	}
`;

export const TitleContainer = styled.div`
	width: 100%;
	padding: 10px 15px;
	position: relative;
	z-index: 1;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	box-sizing: border-box;
	box-shadow: 0 6px 10px rgb(0 0 0 / 4%);
`;
