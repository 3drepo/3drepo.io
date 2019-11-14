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
import { LogList as LogListBase } from '../../../../../components/logList/logList.component';
import PreviewDetailsBase from '../../../previewDetails/previewDetails.container';

export const Container = styled.div``;

export const LogList = styled(LogListBase)`
	height: 100%;
`;

export const LogsContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

export const PreviewDetails = styled(PreviewDetailsBase)``;

export const DescriptionImage = styled.div`
	max-height: 250px;
	overflow: hidden;
`;

export const HorizontalView = styled.div`
	display: flex;
	flex: 1;
	justify-content: flex-start;
	overflow: hidden;

	${PreviewDetails}, ${LogsContainer} {
		min-width: 50%;
		width: 50%;
		max-height: 60vh;
		position: relative;
		overflow: auto;
	}

	${LogList} {
		:before {
			box-shadow: none;
		}
	}
`;
