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
	<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none" className={className}>
		<path
			d="M11.5259 19.9466H1.63155C1.46406 19.9466 1.30342 19.8801 1.18498 19.7616C1.06654 19.6432 1 19.4826 1 19.3151V1.63155C1 1.46406 1.06654 1.30342 1.18498 1.18498C1.30342 1.06654 1.46406 1 1.63155 1H19.3151C19.4826 1 19.6432 1.06654 19.7616 1.18498C19.8801 1.30342 19.9466 1.46406 19.9466 1.63155V11.5259"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M1 14.6846L8.36813 11.5268L14.1574 14.1583M14.6837 17.8424H17.8414M20.9992 17.8424H17.8414M17.8414 17.8424V14.6846M17.8414 17.8424V21.0001M14.6837 8.36905C14.1253 8.36905 13.5899 8.14726 13.1951 7.75246C12.8003 7.35766 12.5785 6.8222 12.5785 6.26387C12.5785 5.70554 12.8003 5.17008 13.1951 4.77528C13.5899 4.38049 14.1253 4.15869 14.6837 4.15869C15.242 4.15869 15.7775 4.38049 16.1723 4.77528C16.5671 5.17008 16.7889 5.70554 16.7889 6.26387C16.7889 6.8222 16.5671 7.35766 16.1723 7.75246C15.7775 8.14726 15.242 8.36905 14.6837 8.36905V8.36905Z"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);
