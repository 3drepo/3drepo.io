/**
 *  Copyright (C) 2024 3D Repo Ltd
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
	<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" className={className}>
		<path
			d="M5.11153 3.18535C5.35866 3.43247 5.35866 3.83315 5.11153 4.08028C4.8644 4.32741 4.46373 4.32741 4.2166 4.08028L2.7166 2.58028C2.59792 2.4616 2.53125 2.30064 2.53125 2.13281C2.53125 1.96498 2.59792 1.80402 2.7166 1.68535L4.2166 0.185346C4.46373 -0.0617822 4.8644 -0.0617821 5.11153 0.185346C5.35866 0.432475 5.35866 0.83315 5.11153 1.08028L4.61818 1.57363C5.87111 1.711 7.10073 2.02551 8.26975 2.50974C9.88845 3.18022 11.3592 4.16298 12.5981 5.40188C13.837 6.64078 14.8198 8.11157 15.4903 9.73027C15.9738 10.8976 16.2881 12.1254 16.4258 13.3765L16.9139 12.8885C17.161 12.6414 17.5617 12.6414 17.8088 12.8885C18.0559 13.1356 18.0559 13.5363 17.8088 13.7834L16.3088 15.2834C16.1901 15.4021 16.0292 15.4688 15.8613 15.4688C15.6935 15.4688 15.5325 15.4021 15.4139 15.2834L13.9139 13.7834C13.6667 13.5363 13.6667 13.1356 13.9139 12.8885C14.161 12.6414 14.5617 12.6414 14.8088 12.8885L15.1281 13.2078C14.9885 12.1819 14.7172 11.176 14.3193 10.2153C13.7125 8.75038 12.8231 7.41932 11.7019 6.29811C10.5807 5.17691 9.24963 4.28752 7.78471 3.68073C6.82613 3.28367 5.82253 3.01271 4.79901 2.87283L5.11153 3.18535Z"
			fill="currentColor"
		/>
		<path
			d="M1.26562 0.632823C1.26562 0.28333 0.982305 1.05051e-05 0.632812 1.05051e-05C0.28332 1.05051e-05 0 0.28333 0 0.632823L0 17.3672C0 17.7167 0.28332 18 0.632812 18L17.3672 18C17.7167 18 18 17.7167 18 17.3672C18 17.0177 17.7167 16.7344 17.3672 16.7344L1.26562 16.7344L1.26562 0.632823Z"
			fill="currentColor"
		/>
	</svg>
);
