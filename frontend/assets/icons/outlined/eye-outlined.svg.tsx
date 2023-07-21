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

type IProps = {
	className?: any;
};

export default ({ className }: IProps) => (
	<svg width="17" height="16" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path
			d="M14.5323 4.95782C13.0102 1.65976 10.7093 0 7.625 0C4.53904 0 2.23982 1.65976 0.717716 4.95947C0.656663 5.09244 0.625 5.23767 0.625 5.38473C0.625 5.53179 0.656663 5.67702 0.717716 5.80999C2.23982 9.10804 4.54064 10.7678 7.625 10.7678C10.711 10.7678 13.0102 9.10805 14.5323 5.80834C14.6559 5.5408 14.6559 5.23031 14.5323 4.95782ZM7.625 9.57872C5.03517 9.57872 3.13896 8.22779 1.80149 5.3839C3.13896 2.54001 5.03517 1.18908 7.625 1.18908C10.2148 1.18908 12.111 2.54001 13.4485 5.3839C12.1126 8.22779 10.2164 9.57872 7.625 9.57872ZM7.56077 2.47726C6.00013 2.47726 4.73492 3.77864 4.73492 5.3839C4.73492 6.98917 6.00013 8.29055 7.56077 8.29055C9.12141 8.29055 10.3866 6.98917 10.3866 5.3839C10.3866 3.77864 9.12141 2.47726 7.56077 2.47726ZM7.56077 7.23359C6.56691 7.23359 5.7625 6.40618 5.7625 5.3839C5.7625 4.36162 6.56691 3.53422 7.56077 3.53422C8.55464 3.53422 9.35904 4.36162 9.35904 5.3839C9.35904 6.40618 8.55464 7.23359 7.56077 7.23359Z"
			fill="currentColor"
		/>
	</svg>
);
