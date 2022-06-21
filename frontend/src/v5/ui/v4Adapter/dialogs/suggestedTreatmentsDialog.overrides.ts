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
import { css } from 'styled-components';
import {
	Container,
	StyledGrid,
	StyledTypography,
	StyledDialogContent,
} from '@/v4/routes/components/dialogContainer/components/suggestedTreatmentsDialog/suggestedTreatmentsDialog.styles';

export default css`
	${Container} {
		${StyledGrid} {
			display: flex;
			justify-content: center;
		}

		${StyledTypography} {
			font-weight: 400;
			font-size: 13px;
			line-height: 1.125rem;
			color: ${({ theme }) => theme.palette.base.main};
		}

		.MuiInputBase-root {
			svg {
				/* TODO: fix after new palette is released */
				color: #C1C8D5;
				margin-top: -15px;
			}
		}

		.MuiSelect-select {
			margin-top: 0;
		}

		${StyledDialogContent} {
			margin-top: 52px;
		}
	}
`;
