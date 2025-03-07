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
import styled from 'styled-components';
import TabBase from '@mui/material/Tab';
import TabPanelBase from '@mui/lab/TabPanel';
import TabListBase from '@mui/lab/TabList';
import { Truncate } from '@/v4/routes/components/truncate/truncate.component';
import { FormModalNoButtons } from '@controls/formModal/formModalNoButtons/formModalNoButtons.component';
import { Typography } from '@controls/typography';

export const FormModal = styled(FormModalNoButtons)`
	.MuiDialogContent-root {
		padding: 0;
		margin-bottom: 0;
		min-width: 522px;
		width: 522px;
	}
`;

export const TruncatableName = styled(Truncate).attrs({
	lines: 1,
	width: 350,
})`
	display: inline-block;
`;

export const Tab = styled(TabBase)`
	padding: 15px 0;
	margin: 0 10px;
	min-width: fit-content;
`;

export const TabList = styled(TabListBase)`
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	transition: none;
	padding-left: 17px;

	box-shadow: 0 0 13px -7px;
	position: relative;
	z-index: 1;
`;

export const TabPanel = styled(TabPanelBase)<{ $personalTab?: boolean }>`
	box-sizing: border-box;
	overflow-x: hidden;
	padding: 0;
`;

export const TabContent = styled.div`
	height: min(554px, 50vh);
	padding: 30px 58px;
	box-sizing: border-box;
	overflow: overlay;

	& > :first-child {
		margin-top: 0;
	}
`;