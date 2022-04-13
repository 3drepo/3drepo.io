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
type IProps = {
	className?: any;
};

export default ({ className }: IProps) => (
	<svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path
			d="M4.07573 8.7728L0.175729 4.8728C-0.0585762 4.63849 -0.0585762 4.25859 0.175729 4.02426L1.02424 3.17573C1.25854 2.9414 1.63846 2.9414 1.87277 3.17573L4.5 5.80294L10.1272 0.175729C10.3615 -0.0585762 10.7415 -0.0585762 10.9758 0.175729L11.8243 1.02426C12.0586 1.25857 12.0586 1.63846 11.8243 1.87279L4.92426 8.77282C4.68994 9.00713 4.31004 9.00713 4.07573 8.7728Z"
			fill="currentColor"
		/>
	</svg>
);
