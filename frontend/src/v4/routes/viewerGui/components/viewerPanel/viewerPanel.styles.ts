/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import Grid from '@mui/material/Grid';
import styled, { css } from 'styled-components';

import { COLOR } from '../../../../styles';
import { Panel as PanelComponent } from '../../../components/panel/panel.component';
import { SubmitButton } from '../../../components/submitButton/submitButton.component';

interface IViewerPanelFooter {
	padding?: string;
}

interface IViewerPanelContent {
	scrollDisabled?: boolean;
}

interface IViewerPanelButton {
	active?: number;
	color?: string;
	type?: string;
	size?: string;
	id?: string;
}

interface IPanel {
	classname?: string;
	isPending?: boolean;
	title?: any;
	flexHeight?: boolean;
}

export const Panel = styled(PanelComponent)<IPanel>`
	height: 100%;
	margin-bottom: 20px;

	&& {
		${({ flexHeight }) => flexHeight ? '' : css`
		height: 100%;` };
	}

	${({ isPending }) => isPending ? css`
		min-height: 120px !important;
	` : ''};

	&:last-child {
		margin-bottom: 0;
	}
`;

export const TitleContainer = styled.div`
	display: flex;
	justify-content: space-between;
	margin: 0 -16px;
	width: calc(100% + 32px);
	height: inherit;

	button {
		color: ${COLOR.WHITE};

		&:disabled {
			color: ${COLOR.GRAY};
		}
	}
`;

export const Title = styled.div`
	align-items: center;
	display: flex;
`;

export const Actions = styled.div`
	align-items: center;
	display: flex;
`;

export const Action = styled.span`
	color: ${COLOR.WHITE};
`;

export const TitleIcon = styled.div`
	align-self: center;
	height: 100%;
	width: 48px;
	display: flex;
	align-items: center;
	justify-content: center;

	&:empty {
		width: 16px;
	}
`;

export const ViewerPanelContent = styled.div<IViewerPanelContent>`
	overflow: ${({ scrollDisabled }) => scrollDisabled ? 'hidden' : 'auto'};
	display: ${({ scrollDisabled }) => scrollDisabled ? 'flex' : 'block'};
	flex-direction: ${({ scrollDisabled }) => scrollDisabled ? 'column' : 'unset'};
	position: relative;
	flex: 1;
`;

export const LoaderContainer = styled(ViewerPanelContent)<IPanel>`
	padding: 24px;
	${({ flexHeight }) => flexHeight ? '' : css`height: 100%;`};
`;

export const ViewerPanelFooter = styled(Grid).attrs({
	direction: 'row',
	container: true,
	wrap: 'nowrap'
})<IViewerPanelFooter>`
	background-color: ${COLOR.WHITE};
	padding: ${({ padding }) => padding || '0 16px' };
	border-top: 1px solid ${COLOR.BLACK_20};
	flex: none;
	min-height: 65px;
	font-size: 14px;
`;

export const ViewerPanelButton = styled(SubmitButton)<IViewerPanelButton>`
	&& {
		flex: none;
		margin-right: -3px;
		width: 40px;
		height: 40px;
		${({ active }) => active ? css`
			background-color: #ff9800;
			&:hover {
				background-color: ${COLOR.DARK_ORANGE};
			}
		` : ''
		}
	}
`;
