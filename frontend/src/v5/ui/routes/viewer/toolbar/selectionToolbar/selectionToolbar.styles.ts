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
import PlusIcon from '@assets/icons/viewer/plus.svg';

export const Section = styled.div`
	display: inherit;
`;

export const Container = styled.div`
	background-color: ${({ theme }) => theme.palette.secondary.mid};
	width: fit-content;
	padding-left: 31px;
	margin-left: -45px;
	cursor: default;

	&:has(> ${/* sc-selector */Section}:not([hidden])) {
		padding-left: 45px;
	}

	& > ${/* sc-selector */Section}:not([hidden]) ~ ${/* sc-selector */Section}:not([hidden]) {
		border-left: solid 1px ${({ theme }) => theme.palette.base.light};
	}
`;

export const ClearIcon = styled(PlusIcon)`
	transform: rotate(45deg);
`;

export const LozengeButton = styled.div<{ variant?: 'filled' | 'outlined', selected?: boolean; }>`
	height: 30px;
	padding: 11px;
	border-radius: 19px;
	box-sizing: border-box;
	align-self: center;
	place-items: center;
	display: flex;
	flex-direction: row;
	overflow: hidden;
	white-space: nowrap;
	transition: all .3s;
	cursor: pointer;
	gap: 6px;
	margin: 0 0 0 5px;
	user-select: none;

	color: ${({ theme }) => theme.palette.primary.contrast};
	border: 1px solid ${({ theme }) => theme.palette.primary.contrast};

	${({ variant }) => variant === 'filled' && css`
		color: ${({ theme }) => theme.palette.primary.lightest};
		background-color: ${({ theme }) => theme.palette.secondary.light};
		border: none;
	`}

	&[hidden] {
		width: 0;
		padding: 0;
		margin: 0;
		border: 0;
	}
	${({ selected }) => selected && css`
		color: ${({ theme }) => theme.palette.primary.main};
		border-color: ${({ theme }) => theme.palette.primary.main};
	`}

	&:not([hidden]) {
		width: fit-content;
	}

	&:hover {
		color: ${({ theme }) => theme.palette.primary.main};
		border-color: ${({ theme }) => theme.palette.primary.main};
	}
`;

export const VerticalRangeContainer = styled(LozengeButton)`
	padding-left: 3px;
	cursor: auto;
	pointer-events: none;
	opacity: 0.25;
`;

export const VerticalRangeValue = styled.div`
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	color: ${({ theme }) => theme.palette.secondary.mid};
	border-radius: 12px 3px 3px 12px;
	width: 70px;
	height: 22px;
	padding: 0 10px;
	text-align: right;
	align-content: center;
	font-size: 15px;
	font-weight: 600;
`;
