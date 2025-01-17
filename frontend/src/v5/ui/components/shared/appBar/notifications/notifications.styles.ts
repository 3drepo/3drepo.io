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

import styled, { css } from 'styled-components';
import { Container as NotificationTeamspace, NotificationsPanelItem } from '@/v4/routes/components/notifications/components/panel/panel.styles';
import { Item, ItemSecondaryAction } from '@/v4/routes/components/notifications/components/notificationItem/notificationItem.styles';
import { NavbarButton } from '@controls/navbarButton/navbarButton.styles';
import { hexToOpacity } from '@/v5/helpers/colors.helper';
import { GRADIENT } from '@/v5/ui/themes/theme';

const navbarButtonStyles = css`
	& > button {
		height: inherit;
		width: inherit;
	}

	.MuiBadge-root {
		> svg {
			height: 17px;
			width: 17px;
		}
		.MuiBadge-badge {
			font-size: 0;
			height: 11px;
			width: 11px;
			padding: 0;
			min-width: unset;
			top: -6px;
			right: -3px;
		}
	}
`;

const containerStyles = css`
	.MuiDrawer-docked > .MuiPaper-root {
		border: none;
		box-shadow: 2px 3px 45px ${hexToOpacity('#000000', 15)};
		width: 520px;
		background-color: ${({ theme }) => theme.palette.tertiary.lightest};
		
		& > ul {
			cursor: initial;
			height: unset;
			width: 100%;
			padding: 15px 25px 10px;
			box-sizing: border-box;
			color: ${({ theme }) => theme.palette.secondary.main};

			& > :nth-child(2) {
				margin-top: 44px;
			}
		}
	}
`;

const headerStyles = css`
	.MuiListSubheader-root {
		position: fixed;
		top: 0;
		margin-left: -25px;
		width: 520px;
		z-index: 2;
	}

	.MuiToolbar-root {
		background: ${GRADIENT.SECONDARY};
		color: ${({ theme }) => theme.palette.primary.contrast};
		min-height: unset;
		height: 44px;

		button {
			margin: 0;
			padding: 2px;
			margin-left: 2px;

			.MuiSvgIcon-root path {
				fill: ${({ theme }) => theme.palette.primary.contrast};
			}
		}
	}
`;

const itemsBatch = css`
	.MuiGrid-root {
		color: ${({ theme }) => theme.palette.base.main};
	}

	${NotificationTeamspace} {
		.MuiGrid-root {
			font-weight: 700;
		}

		ul {
			padding: 0;
			margin-bottom: 14px;

			& > * {
				border-radius: 0;
				margin: 0;
				padding: 3px 0;

				&:not(:last-child) {
					border-bottom: 1px solid ${({ theme }) => theme.palette.base.lightest};
				}
			}
		}
	}
`;

const itemsStyles = css`
	${NotificationsPanelItem} * { 
		${({ theme }) => theme.typography.body1}
		letter-spacing: 0;
	}

	${Item} {
		padding: 5px 15px 5px 3px;
		margin: 0;
		border-radius: 6px;

		&:hover {
			padding-right: 10px;
			background-color: transparent;
		}
		
		${ItemSecondaryAction} span {
			margin: 0;
			padding: 13px;
			display: flex;
			color: ${({ theme }) => theme.palette.secondary.main};
			
			svg {
				font-size: 24px;
			}

			&:first-child svg {
				font-size: 20px;
			}

			&:hover {
				background-color: transparent;
			}
		}

		& > .MuiList-root .MuiPaper-root {
			box-sizing: border-box;
		}

		.MuiListItemText-root {
			* {
				box-sizing: border-box;
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
			}

			& > span {
				font-weight: 700;
			}

			& > p > span {
				font-weight: 500;
			}
		}
	}
`;

const avatarStyles = css`
	.MuiAvatar-root {
		margin: 0 7px 0 0;
		width: 45px;
		height: 45px;
		background: ${({ theme }) => theme.palette.primary.contrast};

		svg {
			font-size: 22px;
			margin: -4px -1px 0 0;
		}
	}
`;

export const Container = styled(NavbarButton).attrs({ as: 'div' })`
	box-sizing: border-box;
	* {
		text-transform: none;
	}
	.MuiPaper-root,
	.MuiList-padding {
		box-shadow: none;
	}

	.MuiListItem-root.MuiListItem-root {
		padding: 0;
	}

	${navbarButtonStyles}
	${containerStyles}
	${headerStyles}
	${itemsBatch}
	${itemsStyles}
	${avatarStyles}
`;
