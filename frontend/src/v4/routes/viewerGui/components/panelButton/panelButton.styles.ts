/**
 *  Copyright (C) 2017 3D Repo Ltd
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
import { COLOR } from '../../../../styles';
import { TooltipButton } from '../../../teamspaces/components/tooltipButton/tooltipButton.component';

export const setStyle = (statement, trueValue, falseValue) => statement ? trueValue : falseValue;

export const Button = styled(TooltipButton)`
	&& {
		background-color: ${(props: any) => props.active ? COLOR.PRIMARY_MAIN : COLOR.REGENT_GRAY};
		color: ${COLOR.WHITE};
		box-shadow: 0 3px 3px ${COLOR.BLACK_16};

		&:hover {
			background-color: ${(props: any) => props.active ? COLOR.PRIMARY_MAIN : COLOR.REGENT_GRAY};
		}
	}
`;

export const ButtonWrapper = styled.div`
	margin-bottom: 20px;
`;
