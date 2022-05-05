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
import { ScrollArea as ScrollAreaBase } from '@controls/scrollArea';
import { V5ModalContainer } from './../dialog.styles';
import { Form as FormBase } from '@controls/modal/formModal/formDialog.styles';
import { DialogTabs, VisualSettingsButtonsContainer } from '@/v4/routes/components/topMenu/components/visualSettingsDialog/visualSettingsDialog.styles';

export const Container = styled(V5ModalContainer)`
	padding: 0;

	.MuiDialogContent-root {
		padding: 0px;
		overflow-x: hidden;
	}

	${DialogTabs} {
		padding-left: 10px;
	}

	${VisualSettingsButtonsContainer} {
		display: flex;
		justify-content: flex-end;
		position: unset;
		box-shadow: 0px 6px 10px rgb(0 0 0 / 14%),
					0px 1px 18px rgb(0 0 0 / 12%),
					0px 3px 5px rgb(0 0 0 / 20%);
		padding: 8px;
		box-sizing: border-box;
	}
`;

export const Form = styled(FormBase)`
	&&& {
		padding-bottom: 0;
		height: auto;
	}
`;

export const ScrollArea = styled(ScrollAreaBase)`
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
`;
