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
	<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path
			d="M34.0733 5.0625H31.2648C30.871 5.0625 30.4974 5.2433 30.2563 5.55268L13.6907 26.5379L5.74738 16.4732C5.62722 16.3207 5.47406 16.1973 5.29939 16.1124C5.12473 16.0275 4.9331 15.9833 4.7389 15.983H1.93042C1.66122 15.983 1.51256 16.2924 1.67729 16.5013L12.6822 30.4433C13.1965 31.0942 14.1849 31.0942 14.7032 30.4433L34.3264 5.57679C34.4911 5.37188 34.3425 5.0625 34.0733 5.0625Z"
			fill="currentColor"
		/>
	</svg>
);
