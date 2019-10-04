/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import { Button, DialogContent, Input, ListItem, Tab, Tabs, Tooltip } from '@material-ui/core';
import { TooltipProps } from '@material-ui/core/Tooltip';
import { omit } from 'lodash';
import React from 'react';
import styled from 'styled-components';
import { COLOR, FONT_WEIGHT } from '../../../../../styles';

export const NegativeActionButton = styled(Button)`
	&& {
		color: ${COLOR.WHITE_87};
		background-color: ${COLOR.NEGATIVE_87};
	}

	&&:hover {
		background-color: ${COLOR.NEGATIVE};
	}
`;

export const NeutralActionButton = styled(Button)`
	&& {
		color: ${COLOR.BLACK_60};
		background-color: ${COLOR.TRANSPARENT};
	}

	&&:hover {
		color: ${COLOR.BLACK_80};
		background-color:  ${COLOR.TRANSPARENT};
	}
`;

export const WarningMessage = styled.div`
	text-align: left;
	color: ${COLOR.VIVID_RED};
	font-size: 12px;
	font-weight: ${FONT_WEIGHT.SEMIBOLD}
`;

export const VisualSettingsButtonsContainer = styled.div`
	justify-content: space-evenly;
	display: flex;
	width: 100%;
	position: absolute;
	bottom: 18px;
	left: 0;
`;

export const VisualSettingsDialogContent = styled(DialogContent)`
	width: 335px;
	height: 280px;
	margin-bottom: 68px;
	&& {
		padding-top: 0;
	}
`;

export const FormListItem = styled(ListItem)`
	display: flex;
	&& {
		justify-content: space-between;
		height: 35px;
	}
`;

export const ErrorTooltip = styled((prop: TooltipProps) => {
	const props = omit(prop, 'className');
	props.classes = { popper: prop.className, tooltip: 'tooltip' };
	return React.createElement(Tooltip, props);
})`
	.tooltip {
		background-color: ${COLOR.LIGHT_GRAY};
		color: ${COLOR.CRIMSON};
		font-size: 12px;
		margin: 0;
	}
`;

export const ShortInput = styled(Input).attrs({
inputProps: {className: 'shortInput'}
})`
	.shortInput {
		text-align: right;
		width: 40px;
	}
`;

export const DialogTabs = styled(Tabs)`
	&& {
		width: 100%;
	}
`;

export const DialogTab = styled(Tab)`
	&& {
		flex-grow: 1;
	}
`;
