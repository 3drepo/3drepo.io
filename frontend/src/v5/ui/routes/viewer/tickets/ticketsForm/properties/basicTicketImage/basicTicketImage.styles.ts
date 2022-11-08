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

import { Typography } from '@mui/material';
import styled from 'styled-components';
import { CentredContainer } from '@controls/centredContainer';
import { hexToOpacity } from '@/v5/ui/themes/theme';

export const Asterisk = styled.span`
	&::after {
		font-weight: 400;
		font-size: 0.75rem;
		color: ${({ theme }) => theme.palette.error.main};
		margin-left: 2px;
		content: '*';
	}
`;

export const Container = styled.div`
	padding: 13px;
	border: solid 1px ${({ theme }) => theme.palette.secondary.lightest};
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	border-radius: 5px;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
`;

export const PropertyName = styled(Typography).attrs({
	variant: 'h5',
})`
	color: ${({ theme }) => theme.palette.secondary.main};
	margin-bottom: 2px;
`;

export const ActionsSide = styled.div`
	display: flex;
	flex-direction: column;
`;

export const ActionsList = styled.ul`
	list-style-type: none;
	padding: 0;
	margin: 0;
`;

export const OverlappingContainer = styled.div`
	position: relative;
	color: ${({ theme }) => theme.palette.primary.contrast};
	& > * {
		position: absolute;
		top: 0;
		left: 0;
		cursor: pointer;
	}
`;

export const ImageSide = styled(OverlappingContainer)`
	border-radius: 5px;
	overflow: hidden;
	height: 101px;
	width: 171px;

	& > * {
		height: 100%;
		width: 100%;
	}
`;

export const Image = styled.img`
	object-fit: cover;
	height: 100%;
	width: 100%;
`;

export const EnlargeContainer = styled(CentredContainer)`
	opacity: 0;
	text-align: center;
	transition: all .2s;
	background-color: ${({ theme }) => hexToOpacity(theme.palette.secondary.main, 85)};

	&:hover {
		opacity: 1;
	}
`;

export const EmptyImageContainer = styled(CentredContainer)<{ disabled: boolean }>`
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	color: ${({ theme }) => theme.palette.base.main};
	text-align: center;
	${({ disabled }) => `cursor: ${disabled ? 'unset' : 'pointer'}`};
`;

export const BrokenImageContainer = styled(EmptyImageContainer)`
	background-color: ${({ theme }) => theme.palette.error.lightest};
	color: ${({ theme }) => theme.palette.error.main};
`;

export const IconText = styled(Typography).attrs({ variant: 'body1' })``;
