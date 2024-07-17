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
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path fillRule="evenodd" clipRule="evenodd" d="M8.63281 12.832C8.63281 14.1264 7.58348 15.1758 6.28906 15.1758C4.99465 15.1758 3.94531 14.1264 3.94531 12.832C3.94531 11.5376 4.99465 10.4883 6.28906 10.4883C7.58348 10.4883 8.63281 11.5376 8.63281 12.832ZM7.22656 12.832C7.22656 13.3498 6.80683 13.7695 6.28906 13.7695C5.7713 13.7695 5.35156 13.3498 5.35156 12.832C5.35156 12.3143 5.7713 11.8945 6.28906 11.8945C6.80683 11.8945 7.22656 12.3143 7.22656 12.832Z" fill="currentColor"/>
		<path fillRule="evenodd" clipRule="evenodd" d="M16.0547 12.832C16.0547 14.1264 15.0054 15.1758 13.7109 15.1758C12.4165 15.1758 11.3672 14.1264 11.3672 12.832C11.3672 11.5376 12.4165 10.4883 13.7109 10.4883C15.0054 10.4883 16.0547 11.5376 16.0547 12.832ZM14.6484 12.832C14.6484 13.3498 14.2287 13.7695 13.7109 13.7695C13.1932 13.7695 12.7734 13.3498 12.7734 12.832C12.7734 12.3143 13.1932 11.8945 13.7109 11.8945C14.2287 11.8945 14.6484 12.3143 14.6484 12.832Z" fill="currentColor"/>
		<path fillRule="evenodd" clipRule="evenodd" d="M12.3438 6.30859C12.3438 7.60301 11.2944 8.65234 10 8.65234C8.70558 8.65234 7.65625 7.60301 7.65625 6.30859C7.65625 5.01418 8.70558 3.96484 10 3.96484C11.2944 3.96484 12.3438 5.01418 12.3438 6.30859ZM10.9375 6.30859C10.9375 6.82636 10.5178 7.24609 10 7.24609C9.48223 7.24609 9.0625 6.82636 9.0625 6.30859C9.0625 5.79083 9.48223 5.37109 10 5.37109C10.5178 5.37109 10.9375 5.79083 10.9375 6.30859Z" fill="currentColor"/>
		<path fillRule="evenodd" clipRule="evenodd" d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20ZM10 18.5938C14.7462 18.5938 18.5938 14.7462 18.5938 10C18.5938 5.2538 14.7462 1.40625 10 1.40625C5.2538 1.40625 1.40625 5.2538 1.40625 10C1.40625 14.7462 5.2538 18.5938 10 18.5938Z" fill="currentColor"/>
	</svg>

);
