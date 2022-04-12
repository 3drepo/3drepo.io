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
import TabListBase from '@mui/lab/TabList';
import TabPanelBase from '@mui/lab/TabPanel';
import { FormModal as FormModalBase } from '@controls/modal/formModal/formDialog.component';

export const FormModal = styled(FormModalBase)`
	.MuiDialogContent-root {
		padding: 0;
	}
`;

export const Tab = styled(TabBase)`
	text-transform: 'none';
    padding: 15px 0;
	margin: 0 24px;
`;

export const TabList = styled(TabListBase)`
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	transition: none;
`;

export const TabPanel = styled(TabPanelBase)`
	padding: 30px 58px;
	height: 554px;
	margin: 0;
`;
