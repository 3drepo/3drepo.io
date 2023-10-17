/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { DragAndDrop } from '@controls/dragAndDrop';
import { DashboardListHeader } from '@components/dashboard/dashboardList/dashboardListHeader';
import { FormModal } from '@controls/formModal/formModal.component';
import { Typography } from '@controls/typography';
import { memo } from 'react';

const MODAL_PADDING = 35;

export const Modal = memo(styled(FormModal)`
	.MuiPaper-root {
		min-width: 955px;
		.MuiDialogContent-root {
			padding: 0;
		}
	}
`, (prevProps, nextProps) => {
	const val = prevProps.isValid === nextProps.isValid
		&& (prevProps.fields.length === nextProps.fields.length )
		&& prevProps.isUploading === nextProps.isUploading
		&& prevProps.open === nextProps.open;

	return val;
});

export const UploadsContainer = styled.div`
	display: flex;
	flex-direction: row;
	height: 100%;
	width: 100%;
	box-sizing: border-box;
	overflow-x: hidden;
`;

export const UploadsListScroll = styled.div`
	min-height: 100vh;
	max-height: 200px;
	width: 100%;
	overflow-y: scroll;
`;

export const Padding = styled.div`
	margin: ${MODAL_PADDING}px;
	padding-bottom: 0;
	box-sizing: border-box;
`;

export const DropZone = styled(DragAndDrop)`
	max-height: 190px;
	width: auto;
`;

export const UploadsListHeader = styled(DashboardListHeader)`
	padding: 0 45px 13px 25px;
	margin-top: 0;
`;

export const HelpText = styled(Typography).attrs({
	variant: 'h5',
})`
	color: ${({ theme }) => theme.palette.base.main};
	padding: 10px;
	a {
		color: inherit;
	}
`;
