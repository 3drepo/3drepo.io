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

import styled, { css } from 'styled-components';

import { Form } from 'formik';

import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	IconButton,
	Typography as TypographyComponent
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {GROUP_PANEL_NAME, GROUPS_TYPES} from '../../../../constants/groups';

import { COLOR } from '../../../../styles';
import { Container as MessageListContainer, FilterWrapper } from '../../../components/messagesList/messagesList.styles';

const SUMMARY_HEIGHT = 78;

const containerStyle = (edit: boolean, panelName: string = '', isSmartGroup: boolean) => {
	if (panelName === GROUP_PANEL_NAME) {
		return isSmartGroup ? COLOR.BLACK_6 : COLOR.WHITE;
	}

	return !edit ? COLOR.WHITE : COLOR.BLACK_6;
};

interface IContainer {
	edit: boolean;
	panelName: string;
	isSmartGroup?: boolean;
}

export const Container = styled.div`
	color: ${COLOR.BLACK_60};
	background-color: ${({ edit, panelName, isSmartGroup }: IContainer) => containerStyle(edit, panelName, isSmartGroup)};
	overflow: hidden;
	display: flex;
	flex-direction: column;
	height: 100%;
`;

export const Collapsable = styled(Accordion)`
	&& {
		box-shadow: none;
		padding: 0 12px;
		margin-bottom: 0;
		position: static;
	}
`;

export const Details = styled(AccordionDetails)`
	&& {
		display: flex;
		flex-direction: column;
		padding: 0 2px;
		position: relative;
		padding-top: ${(props: any) => props.margin ? `${props.margin + 12}px` : '0px'};
	}
`;

export const Summary = styled(AccordionSummary)`
	&& {
		display: none;
	}
` as any;

export const Header = styled(AccordionSummary).attrs({
	classes: {
		focused: 'focused',
		expandIcon: 'summary-icon',
	}
})`
	&& {
		min-height: ${SUMMARY_HEIGHT}px;
		width: 100%;
		box-sizing: border-box;
		padding: 0 12px;
		background-color: ${COLOR.WHITE};
		z-index: 2;

		&.focused {
			background-color: ${COLOR.WHITE};
		}

		.summary-icon {
			display: none;
		}

		box-shadow: ${({expanded}: { expanded: boolean }) => expanded ? `0 4px 7px -4px ${COLOR.BLACK_30};` : 'none'};
	}
` as any;

export const CollapsableContent = styled.div`
	margin-bottom: 8px;
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
	position: relative;
	flex-grow: 1;

	&:before {
		position: absolute;
		z-index: 5;
		top: 0;
		left: 0;
		pointer-events: none;
		width: 100%;
		content: '';
		height: 10px;
		overflow: hidden;
		box-shadow: inset 0 4px 7px -4px ${COLOR.BLACK_30};
	}
`;

export const ToggleButtonContainer = styled.div`
	display: flex;
	justify-content: center;
	top: auto;
	background-color: ${COLOR.WHITE};
	width: 100%;
	z-index: 1;
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

export const Typography = styled(TypographyComponent)`
	&& {
		max-height: 45px;
		overflow: hidden;
		margin-right: 24px;
		margin-bottom: 0;
	}
`;

export const MainInfoContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
	padding-right: 0 !important;
`;

const unexpandedStyles  = css`
	height: calc(100% - ${SUMMARY_HEIGHT}px);

	${NotCollapsableContent} {
		height: calc(100% - 40px);
	}

	${MessageListContainer} {
		height: calc(100% - 40px);
	}
`;

const expandedStyles = css`
	overflow: auto;
	position: static;

	${MessageListContainer} {
		height: auto;
	}

`;

export const ScrollableContainer = styled.div`
	${({ expanded }: { expanded: boolean }) => expanded ? expandedStyles : unexpandedStyles};
	display: flex;
	flex-direction: column;
`;
