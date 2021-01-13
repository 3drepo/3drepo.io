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

import styled from 'styled-components';

import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { cond, constant, matches, stubTrue } from 'lodash';

import { COLOR } from '../../../../../../styles';
import { Image as ImageComponent } from '../../../../../components/image';
import { MessagesList as MessagesListComponent } from '../../../../../components/messagesList/';
import {
	Container as MessageListContainer,
	FilterWrapper,
} from '../../../../../components/messagesList/messagesList.styles';
import * as TextFieldStyles from '../../../../../components/textField/textField.styles';
import PreviewDetailsBase from '../../../previewDetails/previewDetails.container';
import { Container as PreviewDetailsContainer } from '../../../previewDetails/previewDetails.styles';
import { Container as TabContainer } from '../../../risks/components/riskDetails/riskDetails.styles';

export const StyledFormControl = styled(FormControl)`
`;

export const MessagesList = styled(MessagesListComponent)`
	height: 100%;
`;

export const MessageContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

export const PreviewDetails = styled(PreviewDetailsBase)``;

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	position: relative;
	overflow: hidden;
	flex: ${(props: { fill: boolean; }) => props.fill ? 1 : 'auto'};
	padding-top: ${(props: { top: boolean; }) => props.top ? '16px' : 'auto'};

	${TextFieldStyles.StyledTextField} {
		margin: 1px 0;
	}

	${TextFieldStyles.Container},
	${StyledFormControl} {
		margin: 1px 0;
	}
`;

const getFieldsContainerSize = cond([
	[matches('wide'), constant(57)],
	[matches('tight'), constant(37)],
	[stubTrue, constant(47)]
]);

export const FieldsContainer = styled.div`
	display: flex;
	flex-direction: column;
	margin-bottom: auto;
	overflow: hidden;
	width: ${({ size }) => getFieldsContainerSize(size)}%;

	${TextFieldStyles.Container},
	${StyledFormControl} {
		margin: 5px 0;
		width: 100%;
	}
`;

export const FieldsRow = styled(Grid)`
	${TextFieldStyles.StyledTextField} {
		margin: 1px 0;
	}

	${TextFieldStyles.Container},
	${StyledFormControl} {
		flex: ${(props: any) => props.flex ? props.flex : 1};
		margin: 1px 0;

		&:nth-child(2n + 1) {
			margin-right: 25px;
		}
	}

	.select {
		color: inherit;
	}
` as any;

export const DescriptionImage = styled(ImageComponent)`
	img {
		display: block;
		margin-top: 6px;
		margin-bottom: 8px;
		max-width: 100%;
		width: 100%;
		max-height: 200px;
		height: auto;
	}
` as any;

export const HorizontalView = styled.div`
	display: flex;
	flex: 1;
	justify-content: flex-start;
	overflow: hidden;

	${PreviewDetails}, ${MessageContainer} {
		min-width: 50%;
		width: 50%;
		min-height: 60vh;
		max-height: 75vh;
		position: relative;
		overflow: auto;
	}

	${MessagesList} {
		:before {
			box-shadow: none;
		}
	}

	${PreviewDetailsContainer} {
		background-color: ${COLOR.WHITE};
	}

	${MessageListContainer}, ${FilterWrapper} {
		background-color: ${COLOR.BLACK_6};
	}
`;

export const TabContent = styled.div`
	background-color: ${COLOR.WHITE};
	flex: 1;
	position: relative;
	overflow: hidden;
	display: flex;
	height: inherit;
`;

export const StyledTab = styled(Tab)`
	&& {
		font-size: 13px;
	}
`;

export const StyledTabs = styled(Tabs)`
	&& {
		${StyledTab} {
			&:first-of-type {
				max-width: 52px;
			}
		}
	}
`;

export const Content = styled.div`
	display: ${(props) => props.active ? 'block' : 'none'};
	width: 100%;
	margin-bottom: 5px;

	${TabContainer} {
		margin-top: 6px;
	}
`;

export const ExpandAction = styled.span`
	font-size: 11px;
	cursor: pointer;
	display: block;
	text-align: center;
	margin-top: ${(props) => props.top ? '5px' : 0};
`;

export const SuggestionButtonWrapper = styled.div`
	position: absolute;
	z-index: 1;
	top: 0;
	right: 0;
`;
