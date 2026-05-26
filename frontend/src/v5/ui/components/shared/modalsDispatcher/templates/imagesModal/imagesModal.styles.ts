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
import { Dialog } from '@mui/material';
import styled, { css } from 'styled-components';
import { CloseButton as BaseCloseButton } from '@controls/button/closeButton/closeButton.component';
import { AuthImg } from '@components/authenticatedResource/authImg.component';
import { hexToOpacity } from '@/v5/helpers/colors.helper';

export const Modal = styled(Dialog)`
	.MuiPaper-root {
		border-radius: 0;
		width: 100vw;
		max-width: unset;
		height: 100vh;
		max-height: unset;
		padding: 0 22px;
		margin: 0;
		box-sizing: border-box;

		display: flex;
		flex-direction: column;
	}
`;

const FlexRow = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
`;

export const TopBar = styled(FlexRow)`
	justify-content: space-between;
	margin: 16px 0 42px;
`;

export const Buttons = styled(FlexRow)`
	gap: 9px;
`;

export const Counter = styled.div<{ $counterChars: number }>`
	background-color: ${({ theme }) => hexToOpacity(theme.palette.primary.contrast, 15)};
	border-radius: 10px;
	color: ${({ theme }) => theme.palette.primary.contrast};
	font-weight: 600;
	width: fit-content;
	height: 36px;
	padding: 0 16px;
	font-variant-numeric: tabular-nums;
	display: grid;
	place-items: center;
`;

const Button = styled(NavbarButton)`
	height: 36px;
	min-width: 36px;
	width: 36px;
	box-sizing: border-box;
	cursor: pointer;
	margin: 0;
	border: none;
	background-color: ${({ theme }) => hexToOpacity(theme.palette.primary.contrast, 3.9)};

	&&.Mui-disabled {
		pointer-events: none;
		opacity: .25;
		color: ${({ theme }) => theme.palette.primary.contrast};
	}
`;

export const CloseButton = styled(BaseCloseButton)`
	margin: 0;
	height: 36px;
	width: 36px;
	min-width: 36px;
	top: 16px;
	box-sizing: border-box;
	right: 20px;
`;

export const TopBarButton = styled(Button)`
	border-radius: 8px;

	svg {
		width: 17px;
	}
`;

export const TextTopBarButton = styled(TopBarButton)`
	font-weight: 600;
	gap: 8px;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	color: ${({ theme }) => theme.palette.secondary.main};
	width: 119px;

	&:hover, &.Mui-focusVisible {
		background-color: ${({ theme }) => theme.palette.secondary.main};
		color: ${({ theme }) => theme.palette.primary.contrast};
		text-decoration: none;
	}

	svg {
		height: 18px;
	}
`;

export const CenterBar = styled.div`
	display: flex;
	flex-direction: column;
`;

export const Image = styled(AuthImg).attrs({
	alt: formatMessage({ id: 'modal.image', defaultMessage: 'Enlarged image' }),
})`
	max-width: 100%;
	max-height: 100%;
	box-sizing: border-box;
	border: solid 1px ${({ theme }) => theme.palette.secondary.light};
	border-radius: 10px;
`;

export const ImageContainer = styled(FlexRow)<{ $isCarousel?: boolean }>`
	height: calc(100vh - ${({ $isCarousel }) => $isCarousel ? 210 : 106}px);
	width: 100%;
`;

export const BottomBar = styled.div`
	display: flex;
	gap: 12px;
	margin: 12px 58px;
	overflow-x: scroll;
	flex-wrap: nowrap;
	white-space: nowrap;
`;

export const ImageWithArrows = styled(FlexRow)`
	gap: 22px;
`;

export const NextButton = styled(NavbarButton)<{ disabled?: boolean }>`
	box-sizing: border-box;
	cursor: pointer;
	margin: 0;
	background-color: ${({ theme }) => hexToOpacity(theme.palette.primary.contrast, 3.9)};
	border: none;

	&&.Mui-disabled {
		pointer-events: none;
		opacity: .25;
		color: ${({ theme }) => theme.palette.primary.contrast};
	}

	& svg {
		margin-left: 1px;
		height: 25px;
	}
`;

export const PreviousButton = styled(NextButton)`
	transform: rotate(180deg);
`;

export const ImageThumbnail = styled(AuthImg)`
	width: 100%;
	height: 100%;
	object-fit: cover;
`;

export const ImageThumbnailContainer = styled(FlexRow)<{ selected?: boolean }>`
	box-sizing: border-box;
	cursor: pointer;
	border-radius: 8px;
	min-width: 75px;
	max-width: 75px;
	height: 75px;
	overflow: hidden;

	&:first-of-type {
		margin-left: auto;
	}

	&:last-of-type {
		margin-right: auto;
	}

	${({ selected, theme }) => selected ? css`
		border: solid 4px ${theme.palette.primary.main};
	` : css`
		border: solid 1px ${theme.palette.secondary.light};

		background-color: ${theme.palette.secondary.main};
		&:not(:hover) ${ImageThumbnail} {
			opacity: .8;
		}
	`};
`;
