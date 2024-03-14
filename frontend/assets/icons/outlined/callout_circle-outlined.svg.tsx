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
	<svg className={className} width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M10.8008 0C10.1018 0 9.53516 0.56664 9.53516 1.26562V2.33486C9.15654 2.27896 8.76915 2.25 8.375 2.25C4.02576 2.25 0.5 5.77576 0.5 10.125C0.5 14.4742 4.02576 18 8.375 18C12.7242 18 16.25 14.4742 16.25 10.125C16.25 9.73085 16.221 9.34346 16.1651 8.96484H17.2344C17.9334 8.96484 18.5 8.3982 18.5 7.69922V1.26562C18.5 0.56664 17.9334 0 17.2344 0H10.8008ZM17.2344 1.26562H10.8008V7.69922H17.2344V1.26562ZM8.375 3.51562C8.77081 3.51562 9.15849 3.55042 9.53516 3.61711V7.69922C9.53516 7.79744 9.54635 7.89304 9.56752 7.98483L5.15019 12.4022C4.90306 12.6493 4.90306 13.05 5.15019 13.2971C5.39732 13.5442 5.79799 13.5442 6.04512 13.2971L10.432 8.91026C10.5486 8.94575 10.6725 8.96484 10.8008 8.96484H14.8829C14.9496 9.34151 14.9844 9.72919 14.9844 10.125C14.9844 13.7753 12.0253 16.7344 8.375 16.7344C4.72474 16.7344 1.76562 13.7753 1.76562 10.125C1.76562 6.47474 4.72474 3.51562 8.375 3.51562Z" fill="currentColor"/>
	</svg>
);
