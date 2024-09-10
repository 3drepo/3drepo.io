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
import { SkeletonBlock } from '@controls/skeletonBlock/skeletonBlock.styles';
import { DrawingsCalibrationMenu } from '../../drawingCalibrationMenu/drawingCalibrationMenu.component';
import { CardListItem } from '@components/viewer/cards/card.styles';

export const MainBody = styled.div`
	display: flex;
	flex-direction: row;
	gap: 10px;
`;

export const ImageContainer = styled.div`
	border-radius: 5px;
	border: solid 1px ${({ theme }) => theme.palette.base.lightest};
	box-sizing: border-box;
	height: 75px;
	width: 75px;
	overflow: hidden;

	img {
		object-fit: cover;
		width: 100%;
		height: 100%;
	}
`;

export const InfoContainer = styled.div`
	width: 235px;
`;

export const BreakingLine = styled.div`
	padding-bottom: 5px;
	line-height: 10px;
`;

export const PropertyValue = styled.span`
	color: ${({ theme }) => theme.palette.secondary.main};
	line-height: 10px;
	padding-bottom: 5px;
	font-size: 10px;
`;

export const Title = styled(PropertyValue)`
	font-weight: 600;
	font-size: 12px;
	line-height: 18px;
	width: fit-content;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;

	&:hover {
		text-decoration: underline;
	}
`;

export const Property = styled(PropertyValue)`
	color: ${({ theme }) => theme.palette.base.main};
`;

export const BottomLine = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	margin-top: 5px;

	${BreakingLine} {
		padding-bottom: 0;
	}
`;
 
export const CalibrationButton = styled(DrawingsCalibrationMenu)`
	display: flex;
	justify-content: end;
`;

export const SkeletonText = styled(SkeletonBlock)`
	display: inline-block;
	margin-bottom: -2px;
`;

export const Description = styled(PropertyValue)`
	width: 100%;
	max-width: 100%;
	display: block;

	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;

	@supports (-webkit-line-clamp: 3) {
		/* stylelint-disable-next-line */
		display: -webkit-box;
		/* stylelint-disable-next-line */
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		white-space: initial;
		padding-bottom: 1px;
		margin-bottom: 4px;
	}
`;

export const Container = styled(CardListItem)<{ $selected: boolean }>`
	${({ theme, $selected }) => $selected && css`
		background-color: ${theme.palette.primary.lightest};
		${Title} {
			color: ${theme.palette.primary.dark}
		}
	`}
`;
