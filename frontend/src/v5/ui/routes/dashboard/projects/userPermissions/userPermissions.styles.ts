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
import { ModelsPermissions } from '@/v4/routes/modelsPermissions';
import { ModelsContainer } from '@/v4/routes/modelsPermissions/modelsPermissions.styles';
import { Container as TextOverlay } from '@/v4/routes/components/textOverlay/textOverlay.styles';
import { Row, BodyWrapper } from '@/v4/routes/components/customTable/customTable.styles';
import { Detail, Name } from '@/v4/routes/components/modelItem/modelItem.styles';
import { FixedOrGrowContainer } from '@controls/fixedOrGrowContainer';

export const V4ModelsPermissions = styled(ModelsPermissions)`
	${ModelsContainer} {
		border: 0;
		margin-right: 30px;
				
		.Mui-checked svg { 
			border-radius: 3px;
			background-color: ${({ theme }) => theme.palette.primary.contrast};
		}

		.MuiCheckbox-root:hover {
			background: transparent;
		}

		${BodyWrapper} .simplebar-content {
			overflow: hidden;

			${Row} ${Name} {
				color: ${({ theme }) => theme.palette.secondary.main};
			}
		
			${Row}.selected {

				${Name} {
					color: ${({ theme }) => theme.palette.primary.contrast};
				}
				
				background-color: ${({ theme }) => theme.palette.secondary.main};
			}
		}

		${Detail} {
			color: ${({ theme }) => theme.palette.base.main}
		}
	}

	${TextOverlay} {
		background: rgba(255, 255, 255, 0.89);
		${({ theme }) => theme.typography.h4};
		color: ${({ theme }) => theme.palette.secondary.main};
		border-radius: 10px;
	}
`;

export const Container = styled(FixedOrGrowContainer)`
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding-top: 5px;
`;
