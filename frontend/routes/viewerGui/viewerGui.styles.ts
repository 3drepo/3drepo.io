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

import styled, { css } from 'styled-components';
import { COLOR } from '../../styles';

export const Container = styled.div`
	height: 100%;
	pointer-events: none;
	z-index: 1;
	flex: 1;
  position: relative;
`;

const panelStyles = css`
	width: 380px;
	height: calc(100% - 95px);
	position: absolute;
	top: 0;
	display: flex;
	flex-direction: column;

	& > * {
		pointer-events: all;
	}
`;

export const LeftPanels = styled.div`
	${panelStyles};
	left: 90px;
`;

export const RightPanels = styled.div`
	${panelStyles};
	right: 90px;
`;

export const LeftPanelsButtons = styled.div`
	pointer-events: all;
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 90px;
	position: relative;
`;

export const DataLoader = styled.div`
	position: fixed;
	pointer-events: none;
	left: 50%;
	bottom: 110px;
	background: rgba(131, 151, 172, 0.85);
	padding: 10px 20px;
	z-index: 2;
	box-shadow: 0px 0px 3px rgba(${COLOR.BLACK_20});
	color: white;
	font-size: 13px;
	border-radius: 10px;
	visibility: ${(props: any) => props.shouldHide ? 'hidden' : 'visible' };
	transform: ${(props: any) => props.shouldHide ? 'translate(-50%, 10px)' : 'translate(-50%, 0)' };
	opacity: ${(props: any) => props.shouldHide ? 0 : 1 };
	transition: visibility 250ms linear, opacity 250ms ease-in-out, transform 250ms ease-in-out;
` as any;
