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

import React from 'react';

type IProps = {
	className?: any;
};

export default ({ className }: IProps) => (
	<svg width="17" height="14" viewBox="0 0 17 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path d="M16.1373 6.075H14.5651V4.475C14.5651 4.255 14.3882 4.075 14.1721 4.075H13.386C13.1698 4.075 12.9929 4.255 12.9929 4.475V6.075H11.4208C11.2046 6.075 11.0277 6.25499 11.0277 6.47499V7.27499C11.0277 7.49499 11.2046 7.67499 11.4208 7.67499H12.9929V9.27499C12.9929 9.49499 13.1698 9.67499 13.386 9.67499H14.1721C14.3882 9.67499 14.5651 9.49499 14.5651 9.27499V7.67499H16.1373C16.3535 7.67499 16.5303 7.49499 16.5303 7.27499V6.47499C16.5303 6.25499 16.3535 6.075 16.1373 6.075ZM6.3112 7.27499C8.04796 7.27499 9.45555 5.84249 9.45555 4.075C9.45555 2.3075 8.04796 0.875 6.3112 0.875C4.57444 0.875 3.16685 2.3075 3.16685 4.075C3.16685 5.84249 4.57444 7.27499 6.3112 7.27499ZM8.51225 8.07499H8.10201C7.55666 8.32999 6.9499 8.47499 6.3112 8.47499C5.67251 8.47499 5.0682 8.32999 4.5204 8.07499H4.11016C2.28742 8.07499 0.808594 9.57999 0.808594 11.435V12.475C0.808594 13.1375 1.33675 13.675 1.98772 13.675H10.6347C11.2857 13.675 11.8138 13.1375 11.8138 12.475V11.435C11.8138 9.57999 10.335 8.07499 8.51225 8.07499Z" fill="#6B778C" />
	</svg>
);
