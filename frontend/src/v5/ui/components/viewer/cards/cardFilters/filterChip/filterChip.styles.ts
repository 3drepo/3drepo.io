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

export const TextWrapper = styled.div`
	max-width: 150px;
	overflow: hidden;
	display: inline-flex;
`;

export const Property = styled.span`
	flex-shrink: 0;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	max-width: calc(100% - 37px);
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
	
	${({ $multiple }) => $multiple && css`
		text-decoration: underline;
	`}
`;

export const DeleteButton = styled.div`
	cursor: pointer;
	color: ${({ theme }) => theme.palette.primary.contrast};
	background-color: ${({ theme }) => theme.palette.base.main};
	border-radius: 50%;
	height: 16px;
	width: 16px;
	display: grid;
	place-content: center;

	&:hover {
		background-color: ${({ theme }) => theme.palette.base.dark};
	}

	svg {
		width: 8px;
		height: 8px;
	}
`;

const selectedOrHoveredStyles = css`
	background-color: ${({ theme }) => theme.palette.base.main};
	color: ${({ theme }) => theme.palette.primary.contrast};
	border-color: ${({ theme }) => theme.palette.base.main};

	${OperatorIconContainer} {
		border-color: currentColor;
	}

	${DeleteButton} {
		color: ${({ theme }) => theme.palette.base.main};
		background-color: ${({ theme }) => theme.palette.primary.contrast};

		&:hover {
			background-color: ${({ theme }) => theme.palette.base.light};
		}
	}
`;

export const ChipContainer = styled.div<{ selected: boolean }>`
	box-sizing: border-box;
	height: 24px;
	border-radius: 12px;
	border: solid 1px ${({ theme }) => theme.palette.base.light};
	color: ${({ theme }) => theme.palette.base.main};
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	padding: 3px 3px 3px 6px;
	display: inline-flex;
	justify-content: space-between;
	align-items: center;
	gap: 4px;
	cursor: pointer;

	${({ selected }) => selected && selectedOrHoveredStyles}
	&:hover {
		${selectedOrHoveredStyles}
	}
`;