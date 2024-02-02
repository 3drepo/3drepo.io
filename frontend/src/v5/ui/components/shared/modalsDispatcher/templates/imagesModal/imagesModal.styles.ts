/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { formatMessage } from '@/v5/services/intl';
import { NavbarButton } from '@controls/navbarButton/navbarButton.styles';
import { Modal as ModalBase, CloseButton as CloseButtonBase } from '@components/shared/modalsDispatcher/modalsDispatcher.styles';
import styled, { css } from 'styled-components';
import { hexToOpacity } from '@/v5/ui/themes/theme';

export const Modal = styled(ModalBase).attrs({
	maxWidth: 'lg',
})`
	.MuiPaper-root {
		border-radius: 0;
		max-height: unset;
	}
`;

export const FlexRow = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
`;

export const TopBar = styled(FlexRow)`
	left: 0;
	top: 0;
	position: fixed;
	width: 100%;
	padding: 16px 27px;
	box-sizing: border-box;
	justify-content: space-between;
	align-items: center;
`;

export const Counter = styled.div`
	background-color: ${({ theme }) => hexToOpacity(theme.palette.primary.contrast, 15)};
	padding: 5px 10px;
	border-radius: 10px;
	margin-right: 22px;
	color: ${({ theme }) => theme.palette.primary.contrast};
	font-weight: 700;
`;

export const CloseButton = styled(CloseButtonBase)`
	color: ${({ theme }) => theme.palette.primary.contrast};
	position: unset;
`;

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	max-height: calc(100vh - 10px);
	width: 100%;
	max-width: calc(100vw - 64px);
`;

export const Image = styled.img.attrs({
	alt: formatMessage({ id: 'modal.image', defaultMessage: 'Enlarged image' }),
})`
	object-fit: contain;
	height: calc(100vh - 210px);
	max-width: min(1200px, calc(100vw - 250px));
`;

export const ImageWithArrows = styled(FlexRow)`
	position: relative;
	margin-top: 27px;
`;

export const NextButton = styled(NavbarButton)`
	position: fixed;
	top: calc(50% - 50px);
	cursor: pointer;
	right: 63px;
	border-width: 2px;
	height: 32px;
	min-width: 32px;
	width: 32px;

	&:hover {
		background-color: ${({ theme }) => theme.palette.primary.contrast};
	}
	& svg {
		margin-left: 1px;
	}
`;

export const PreviousButton = styled(NextButton)`
	transform: rotate(180deg);
	right: unset;
	left: 63px;
`;

export const ImagesContainer = styled.div`
	display: flex;
	gap: 12px;
	margin-top: 12px;
	overflow-x: scroll;
`;

export const ImageThumbnail = styled.img<{ selected?: boolean }>`
	border-radius: 8px;
	min-width: 120px;
	max-width: 120px;
	height: 68px;
	object-fit: cover;
	box-sizing: border-box;
	cursor: pointer;

	${({ selected }) => selected && css`
		border: solid 2px ${({ theme }) => theme.palette.primary.main};
	`}
`;
