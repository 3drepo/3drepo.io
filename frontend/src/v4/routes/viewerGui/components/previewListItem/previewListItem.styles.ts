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

import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import ArrowIcon from '@mui/icons-material/ArrowForward';
import styled, { css } from 'styled-components';

import { AuthImg } from '@components/authenticatedImage/authImg.component';
import { COLOR } from '../../../../styles/colors';
import OpenInViewerButtonComponent from '../../../components/openInViewerButton/openInViewerButton.container';

export const OpenInViewerButton = styled(OpenInViewerButtonComponent)`
	&& {
		display: none;
		top: -6px;
		right: -3px;

		&:hover {
			display: block;
		}
	}
`;

export const ArrowButton = styled(Button)`
	&& {
		background-color: ${COLOR.PRIMARY_DARK};
		position: absolute;
		right: 0;
		top: 0;
		width: 28px;
		min-width: 37px;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0;

		&:disabled {
			background-color: ${COLOR.PRIMARY_LIGHT};
		}

		&:hover {
			background-color: ${COLOR.PRIMARY_MAIN};
		}
	}
`;

export const MenuItemContainer = styled(MenuItem)<{ expired?: boolean }>`
	position: relative;

	&& {
		background-color: ${(props: any) => props.expired ? COLOR.WARNING_LIGHT : COLOR.WHITE};
		height: 94px;
		border-bottom: 1px solid ${COLOR.BLACK_6};
		padding: 0;

		&:hover {
			background-color: ${(props: any) => props.expired ? COLOR.WARNING : COLOR.GRAY};

			${OpenInViewerButton} {
				display: block;
			}
		}
	}

	${({ theme, expired }) => css`
		&&:hover {
			// TODO - fix after new palette is released
			${!expired && 'background-color: #F7F8FA'}; // TODO - fix after new palette is released
		}
		
		${expired && css`
			${ArrowButton}:not(:disabled) {
				background-color: #ffcac6; // TODO - fix after new palette is released
				svg {
					color: #ff3646; // TODO - fix after new palette is released
				}

				&:hover {
					background-color: #ff3646; // TODO - fix after new palette is released
					svg {
						color: ${theme.palette.primary.contrast};
					}
				}
			}
		`}
	`}
` as any;

export const StyledArrowIcon = styled(ArrowIcon)`
	color: ${COLOR.WHITE};
`;

export const Name = styled(Typography)`
	&& {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1;
	}
	&:hover {
		text-decoration: underline;
	}
`;

export const Container = styled.div`
	display: flex;
	height: inherit;
	overflow: hidden;
	flex: 1;
	box-sizing: border-box;
	padding: 7px 40px 7px 7px;
	position: relative;
`;

const ThumbnailStyles = css`
	background-color: ${COLOR.BLACK_6};
	display: block;
	margin-right: 7px;
	height: 100%;
	width: 80px;
	max-width: 100%;
`;

export const Thumbnail = styled(AuthImg)`
	${ThumbnailStyles};
`;

export const ThumbnailPlaceholder = styled.div`
	${ThumbnailStyles};

	display: flex;
	align-items: center;
	justify-content: center;
	color: ${COLOR.BLACK_30};
`;

export const ThumbnailWrapper = styled.div`
	width: 80px;
`;

export const Content = styled.div`
	min-width: 0;
	flex: 1;
	margin-left: 8px;
`;

export const Description = styled.div`
	font-size: 11px;
	line-height: 1.25;
	margin-top: 3px;
	color: ${COLOR.BLACK_60};
	white-space: normal;
`;

export const RoleIndicator = styled.div`
	background-color: ${(props: any) => props.color || COLOR.WHITE};
	border: 1px solid ${(props: any) => props.color ? COLOR.GRAY : COLOR.BLACK_20};
	height: auto;
	margin-right: 7px;
	width: ${(props: any) => props.width || `5px`};
	min-width: ${(props: any) => props.width || `5px`};
` as any;

export const Actions = styled.div`
	position: absolute;
	right: 40px;
	height: 100%;
	top: 0;
	display: flex;
	align-items: center;
`;
