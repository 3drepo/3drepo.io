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
import Checkers from '@assets/images/checkers.svg';
import { ComponentToString } from '@/v5/helpers/react.helper';
import { StyledIconButton } from '@/v4/routes/teamspaces/components/tooltipButton/tooltipButton.styles';
import styled, { css } from 'styled-components';
import { isV5 } from '@/v4/helpers/isV5';

export const GroupsTreeListItem = styled.li<{ $highlighted?: boolean }>`
	background-color: ${({ $highlighted, theme: { palette } }) => {
		if (isV5()) return $highlighted ? palette.base.lightest : palette.primary.contrast;
		return $highlighted ? '#F7F7F7' : '#FFFFFF';
	}};
	cursor: default;
	position: relative;
`;

export const Separator = styled.hr``;

const GroupsTreeListItemContainerV4 = css`
	max-width: 282px;
	
	~ ${Separator} {
		border: solid 0 #DCDCDC;
	}
`;

const GroupsTreeListItemContainerV5 = css`
	max-width: 311px;

	~ ${Separator} {
		border: solid 0 ${({ theme: { palette } }) => palette.base.lightest};
	}
`;

export const GroupsTreeListItemContainer = styled.div<{ $depth }>`
	padding-left: ${({ $depth }) => $depth * 10}px;
	min-height: 41px;
	align-items: center;
	display: flex;
	overflow: hidden;
	box-sizing: border-box;
	${isV5() ? GroupsTreeListItemContainerV5 : GroupsTreeListItemContainerV4}

	~ ${Separator} {
		margin: 0;
		border-bottom-width: 1px;
	}
`;

const IconSize = css`
	min-width: 30px;
	height: 28px;
`;

const PseudoElement = css`
	${IconSize}
	content: '';
	position: absolute;
	border-radius: ${isV5() ? '3px' : '0'};
	box-sizing: border-box;
`;

export const GroupIcon = styled.div<{ $color?: string, $variant?: 'light' | 'dark' }>`
	${IconSize}
	padding: 0;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: ${isV5() ? '3px' : '0'};
	box-sizing: border-box;
	
	${({ $variant }) => ($variant === 'light' ? css`
		color: ${({ theme }) => (isV5() ? theme.palette.base.main : '#6B778C')};
		border: 1px solid  ${({ theme }) => (isV5() ? theme.palette.base.mid : '#E0E5F0')};`
		: css` color: ${({ theme }) => (isV5() ? theme.palette.primary.contrast : '#fff')};`)};

	& svg {
		z-index: 2;
	}

	&::after {
		background-color: ${({ $color }) => $color};
		${PseudoElement}
		${({ $variant }) => ($variant === 'light' ? css`
		border: 1px solid  ${({ theme }) => (isV5() ? theme.palette.base.mid : '#E0E5F0')};`
		: 'border: 0')};
	}

	&::before {
		background-image:url('data:image/svg+xml;utf8,${ComponentToString(Checkers)}');
		${PseudoElement}
	}
`;

export const ButtonsContainer = styled.div`
	position: absolute;
	right: 30px;
	color: #DCDCDC;
	${StyledIconButton} {
		right: -10px;
	}
`;

export const GroupItemTextContainer = styled.div`
	padding-left: 10px;
	display: inline-flex;
	flex-direction: column;
	max-width: 100%;
	overflow: hidden;
`;

const GroupItemNameV4 = css`
	color: #757575;
	font-family: Roboto;
	font-weight: 500;
	font-size: 12px;
	line-height: 16px;
`;

const GroupItemNameV5 = css`
	${({ theme }) => theme.typography.body1};
	color: ${({ theme }) => theme.palette.secondary.main};
`;

const GroupItemObjectsV4 = css`
	color: #6B778C;
	font-family: inter;
	font-weight: 500;
	font-size: 9px;
	line-height: 16px;
`;

const GroupItemObjectsV5 = css`
	${({ theme }) => theme.typography.caption};
	color: ${({ theme }) => theme.palette.base.main};
`;

export const GroupItemName = styled.div`
	${isV5() ? GroupItemNameV5 : GroupItemNameV4}
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
`;

export const GroupItemObjects = styled.div`
	${isV5() ? GroupItemObjectsV5 : GroupItemObjectsV4}
`;
