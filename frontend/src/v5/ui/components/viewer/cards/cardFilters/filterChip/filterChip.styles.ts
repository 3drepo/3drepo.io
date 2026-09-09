/**
 *  Copyright (C) 2024 3D Repo Ltd
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
import { ChipContainer as BaseChipContainer, selectedOrHoveredStyles } from '@controls/chip/baseChip/baseChip.styles';

export { DeleteButton } from '@controls/chip/baseChip/baseChip.styles';

export const TextWrapper = styled.div`
	overflow: hidden;
	display: inline-flex;
`;

export const Property = styled.span`
	flex-shrink: 1;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	min-width: 19px;
`;

export const OperatorIconContainer = styled.div`
	border: solid 1px ${({ theme }) => theme.palette.base.lightest};
	border-radius: 50%;
	height: 18px;
	aspect-ratio: 1;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	margin-left: 3px;
`;

export const DisplayValue = styled.span<{ $multiple?: boolean }>`
	margin-left: 3px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	min-width: 19px;
	
	${({ $multiple }) => $multiple && css`
		text-decoration: underline;
	`}
`;

const filterChipSelectedOrHoveredStyles = css`
	${selectedOrHoveredStyles}

	${OperatorIconContainer} {
		border-color: currentColor;
	}
`;

export const ChipContainer = styled(BaseChipContainer)`
	${({ selected }) => selected && filterChipSelectedOrHoveredStyles}
	&:hover {
		${filterChipSelectedOrHoveredStyles}
	}
`;