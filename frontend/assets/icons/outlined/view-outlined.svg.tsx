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
	<svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path fillRule="evenodd" clipRule="evenodd" d="M13.75 10.0156C13.75 12.0867 12.0711 13.7656 10 13.7656C7.92893 13.7656 6.25 12.0867 6.25 10.0156C6.25 7.94456 7.92893 6.26562 10 6.26562C12.0711 6.26562 13.75 7.94456 13.75 10.0156ZM12.3438 10.0156C12.3438 11.31 11.2944 12.3594 10 12.3594C8.70558 12.3594 7.65625 11.31 7.65625 10.0156C7.65625 8.72121 8.70558 7.67188 10 7.67188C11.2944 7.67188 12.3438 8.72121 12.3438 10.0156Z" fill="currentColor"/>
		<path fillRule="evenodd" clipRule="evenodd" d="M2.8125 3.19922H4.98047L5.28689 2.39411C5.70212 1.30312 6.74811 0.582031 7.91545 0.582031H12.1113C13.2654 0.582031 14.3023 1.28698 14.7267 2.3601L15.0586 3.19922H17.1875C18.7408 3.19922 20 4.45842 20 6.01172V14.6055C20 16.1588 18.7408 17.418 17.1875 17.418H2.8125C1.2592 17.418 0 16.1588 0 14.6055V6.01172C0 4.45842 1.2592 3.19922 2.8125 3.19922ZM13.419 2.87731L14.1025 4.60547H17.1875C17.9642 4.60547 18.5938 5.23507 18.5938 6.01172V14.6055C18.5938 15.3821 17.9642 16.0117 17.1875 16.0117H2.8125C2.03585 16.0117 1.40625 15.3821 1.40625 14.6055V6.01172C1.40625 5.23507 2.03585 4.60547 2.8125 4.60547H5.94991L6.60117 2.89432C6.80878 2.34883 7.33178 1.98828 7.91545 1.98828H12.1113C12.6883 1.98828 13.2068 2.34075 13.419 2.87731Z" fill="currentColor"/>
	</svg>
);
