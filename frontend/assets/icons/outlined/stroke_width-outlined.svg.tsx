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
	<svg className={className} xmlns="http://www.w3.org/2000/svg" width="21" height="18" viewBox="0 0 21 18" fill="none">
		<path d="M0 1.70142C0 1.29367 0.33054 0.963135 0.738281 0.963135H20.2617C20.6695 0.963135 21 1.29367 21 1.70142C21 2.10916 20.6695 2.4397 20.2617 2.4397H0.738281C0.33054 2.4397 0 2.10916 0 1.70142Z" fill="currentColor"/>
		<path d="M0 7.93579C0 7.12031 0.66108 6.45923 1.47656 6.45923H19.5234C20.3389 6.45923 21 7.12031 21 7.93579C21 8.75127 20.3389 9.41235 19.5234 9.41235H1.47656C0.66108 9.41235 0 8.75127 0 7.93579Z" fill="currentColor"/>
		<path d="M2.21484 13.4319C0.991619 13.4319 0 14.4235 0 15.6467C0 16.87 0.991619 17.8616 2.21484 17.8616H18.7852C20.0084 17.8616 21 16.87 21 15.6467C21 14.4235 20.0084 13.4319 18.7852 13.4319H2.21484Z" fill="currentColor"/>
	</svg>
);
