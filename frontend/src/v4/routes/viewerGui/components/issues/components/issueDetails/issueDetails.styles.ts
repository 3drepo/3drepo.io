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

import Tab from '@mui/material/Tab';

import { Tabs } from '@mui/material';
import { COLOR } from '../../../../../../styles';
import { Image as ImageComponent } from '../../../../../components/image';
import { MessagesList as MessagesListComponent } from '../../../../../components/messagesList/';
import {
	Container as MessageListContainer,
	FilterWrapper,
} from '../../../../../components/messagesList/messagesList.styles';
import PreviewDetailsBase from '../../../previewDetails/previewDetails.container';
import { Container as PreviewDetailsContainer } from '../../../previewDetails/previewDetails.styles';
import { Container as TabContainer } from '../../../risks/components/riskDetails/riskDetails.styles';

export const Container = styled.div``;

export const MessagesList = styled(MessagesListComponent)`
	height: 100%;
`;

export const MessageContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

export const PreviewDetails = styled(PreviewDetailsBase)``;

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
	background-color: ${COLOR.WHITE};

	${PreviewDetails}, ${MessageContainer} {
		min-width: 50%;
		width: 50%;
		min-height: 60vh;
		max-height: 75vh;
		position: relative;
		overflow: auto;
	}

	${MessagesList} {
		&:before {
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
		padding-left: 0;
		padding-right: 0;
		margin-right: 10px;
	}
`;

export const StyledTabs = styled(Tabs)`
	& .MuiTabScrollButton-root {
		width: 15px;
	}

	&& {
		position: relative;
		width: 345px;
	}
`;

export const Content = styled.div<{ active: boolean }>`
	display: ${({ active }) => active ? 'block' : 'none'};
	width: 100%;
	margin-bottom: 5px;

	${TabContainer} {
		margin-top: 6px;
	}
`;
