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
	className?: string,
};

export default ({ className }: IProps) => (
	<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="947" viewBox="0 0 1024 947" fill="none" className={className}>
		<path fillRule="evenodd" clipRule="evenodd" d="M951.685 72.2123L72.3156 72.2123L512.867 873.852L951.685 72.2123ZM951.685 -0.000189427L72.3156 -0.000266304C17.4011 -0.000271105 -17.418 58.8659 9.03004 106.992L449.582 908.631C477.037 958.589 548.839 958.53 576.211 908.526L1015.03 106.886C1041.37 58.7633 1006.55 -0.000184631 951.685 -0.000189427Z" fill="currentColor" />
		<path fillRule="evenodd" clipRule="evenodd" d="M511.885 151.446C531.826 151.446 547.991 167.612 547.991 187.553L547.991 420.238C547.991 440.179 531.826 456.344 511.885 456.344C491.944 456.344 475.778 440.179 475.778 420.238L475.778 187.553C475.778 167.612 491.944 151.446 511.885 151.446Z" fill="currentColor" />
		<path d="M558.021 556.639C558.021 582.119 537.365 602.775 511.885 602.775C486.405 602.775 465.749 582.119 465.749 556.639C465.749 531.159 486.405 510.503 511.885 510.503C537.365 510.503 558.021 531.159 558.021 556.639Z" fill="currentColor" />
	</svg>
);
