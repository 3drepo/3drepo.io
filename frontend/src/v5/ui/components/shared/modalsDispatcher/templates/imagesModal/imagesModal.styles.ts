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

export const Modal = styled(ModalBase).attrs({
	maxWidth: 'lg',
})`
	.MuiPaper-root {
		border-radius: 0;
	}
`;

export const CloseButton = styled(CloseButtonBase)`
	top: 35px;
	right: 50px;
	position: fixed;
	color: ${({ theme }) => theme.palette.primary.contrast};
`;

const modalContentStyles = css`
	height: 100%;
	max-height: calc(100vh - 64px);
	width: 100%;
	max-width: calc(100vw - 64px);
`;

export const Image = styled.img.attrs({
	alt: formatMessage({ id: 'modal.image', defaultMessage: 'Enlarged image' }),
})`
	${modalContentStyles}
	object-fit: cover;
	max-width: min(1200px, calc(100vw - 250px));
`;

export const Container = styled.div`
	${modalContentStyles}
	display: flex;
`;

export const NextButton = styled(NavbarButton)`
	position: fixed;
	top: calc(50% - 10px);
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
