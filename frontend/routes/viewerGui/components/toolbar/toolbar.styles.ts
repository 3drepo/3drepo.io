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
import { TooltipButton } from '../../../teamspaces/components/tooltipButton/tooltipButton.component';

import { COLOR, FONT_WEIGHT } from '../../../../styles';

// tslint:disable-next-line:no-var-requires
const OrthogonalIconSVG = require('../../../../icons/orthogonal.svg');
// tslint:disable-next-line:no-var-requires
const PerspectiveIconSVG = require('../../../../icons/perspective.svg');

export const Container = styled.div`
	background-color: ${COLOR.REGENT_GRAY};
	border: 1px solid ${COLOR.SILVER_CHALICE};
	border-radius: 22px;
	box-shadow: 0 3px 3px ${COLOR.BLACK_16};
	display: flex;
	height: 40px;
	padding: 0 10px;
	justify-content: center;
	align-items: center;
	visibility: ${(props: any) => props.visible ? 'visible' : 'hidden'};
	position: absolute;
	bottom: 35px;
	left: 50%;
	transform: translateX(-50%);
	pointer-events: all;
	z-index: 1;
` as any;

export const ButtonWrapper = styled.div`
	position: relative;
`;

export const ClipIconWrapper = styled.span`
	position: relative;
`;

export const ClipNumber = styled.span`
	position: absolute;
	left: 8px;
	top: 5px;
	font-size: 9px;
	font-weight: ${FONT_WEIGHT.BOLD};
`;

export const Submenu = styled.div`
	position: absolute;
	bottom: 100%;
`;

export const SubmenuDot = styled.i`
	&::before {
		content: '\\25CF';
		font-size: 8px;
		color: ${COLOR.WHITE};
		width: 100%;
		position: absolute;
		font-style: normal;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		text-align: center;
	}
`;

export const ToolbarButton = styled(TooltipButton)`
	&& {
		height: 40px;
		width: 40px;
		font-size: 1rem;
		padding: 10px;

		svg {
			font-size: 20px;
		}

		background-color: ${(props: any) => props.coloured ? COLOR.SUNGLOW : COLOR.REGENT_GRAY};
		color: ${(props: any) => props.active && props.variant === 'primary' ? COLOR.SUNGLOW : COLOR.WHITE};
		box-shadow: ${(props: any) => props.variant === 'secondary' ? `0 3px 3px ${COLOR.BLACK_16}` : 'none'};
		margin-bottom: ${(props: any) => props.variant === 'secondary' ? `10px` : '0'};

		&:hover {
			background-color: ${(props: any) => props.coloured ? COLOR.SUNGLOW : COLOR.REGENT_GRAY};
		}
	}
` as any;

export const Icon = styled.img`
	max-height: 20px;
	max-width: 20px;
`;

export const OrthogonalIcon = styled(Icon).attrs({
	src: OrthogonalIconSVG,
})``;

export const PerspectiveIcon = styled(Icon).attrs({
	src: PerspectiveIconSVG,
})``;
