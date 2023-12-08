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
	<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<g className="hide-o">
			<g className="primary">
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M0.202925 0.202925C0.450053 -0.0442041 0.850728 -0.044204 1.09786 0.202925L17.7971 16.9021C18.0442 17.1493 18.0442 17.5499 17.7971 17.7971C17.5499 18.0442 17.1493 18.0442 16.9021 17.7971L13.1289 14.0239C11.8709 14.7435 10.4716 15.2051 9.00002 15.2051C7.10274 15.2051 5.32554 14.4377 3.81629 13.3395C2.30577 12.2403 1.028 10.7848 0.115159 9.3376C-0.0293216 9.10854 -0.0120279 8.81294 0.158176 8.60229C1.20462 7.30718 2.39697 5.85715 3.83505 4.72998L0.202925 1.09786C-0.044204 0.850728 -0.044204 0.450053 0.202925 0.202925ZM9.93657 10.8315L10.859 11.7539C10.3284 12.1127 9.68869 12.3223 9 12.3223C7.16516 12.3223 5.67773 10.8348 5.67773 9C5.67773 8.31131 5.88729 7.67156 6.24611 7.14104L7.16849 8.06343C7.16849 8.06343 7.1685 8.06342 7.16849 8.06343L9.93657 10.8315Z"
					fill="currentColor"
				/>
				<path
					d="M12.3223 9C12.3223 9.01915 12.3221 9.03826 12.3218 9.05734L15.5033 12.2388C16.4432 11.3488 17.2518 10.3412 17.8848 9.3376C18.0293 9.10855 18.012 8.81295 17.8418 8.6023C15.7466 6.00912 13.0664 2.79492 9.00002 2.79492C8.09861 2.79492 7.26532 2.95286 6.49142 3.22697L8.94266 5.67822C8.96174 5.6779 8.98085 5.67773 9 5.67773C10.8348 5.67773 12.3223 7.16516 12.3223 9Z"
					fill="currentColor"
				/>
			</g>
			<path
				className="highlight"
				d="M7.1685 8.06348C7.02457 8.34438 6.94336 8.66273 6.94336 9.00005C6.94336 10.1359 7.86415 11.0567 9 11.0567C9.33732 11.0567 9.65567 10.9755 9.93657 10.8315L7.1685 8.06348Z"
				fill="currentColor"
			/>
		</g>
	</svg>
);
