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
import { Form } from 'formik';

import { ExpansionPanel, IconButton, ExpansionPanelDetails, ExpansionPanelSummary } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { COLOR } from './../../../../styles/colors';

const SUMMARY_HEIGHT = '64px';
const TOGGLE_BUTTON_HEIGHT = '32px';

export const Container = styled.div`
	color: ${COLOR.BLACK_60};
	background-color: ${COLOR.WHITE};
	overflow: auto;
`;

export const Collapsable = styled(ExpansionPanel)`
	&& {
		box-shadow: none;
		padding: 0 12px;
		margin-bottom: 0;
		position: static;
	}
`;

export const Details = styled(ExpansionPanelDetails)`
	&& {
		display: flex;
		flex-direction: column;
		padding: ${SUMMARY_HEIGHT} 2px 0;
		position: relative;
	}
`;

export const Summary = styled(ExpansionPanelSummary).attrs({
	classes: {
		expandIcon: 'summary-icon'
	}
})`
	&& {
		position: absolute;
    height: ${SUMMARY_HEIGHT};
    width: 100%;
    left: 0;
		top: 40px;
    box-sizing: border-box;
		padding: 0 20px;
		background-color: ${COLOR.WHITE};
    z-index: 1;

		.summary-icon {
			display: none;
		}
	}
`;

export const CollapsableContent = styled.div`
	margin: 8px 0;
`;

export const StyledForm = styled(Form)`
	&& {
		width: 100%;
		padding-right: 4px !important;
	}
`;

export const Content = styled.div`
	background-color: ${COLOR.BLACK_6};
`;

export const NotCollapsableContent = styled.div`
`;

export const ToggleButtonContainer = styled.div`
	display: flex;
	justify-content: center;
	top: auto;
	background-color: ${COLOR.WHITE};
	width: 100%;
	z-index: 2;
	margin-top: ${(props: any) => props.expanded ? 0 : SUMMARY_HEIGHT};
	position: static;
` as any;

export const ToggleButton = styled(IconButton)`
	&& {
		padding: 4px;
	}
`;

export const ToggleIcon = styled(ExpandMoreIcon)`
	&& {
		transform: ${(props: any) => props.active ? `rotate(180deg)` : `rotate(0deg)`};
	}
` as any;
