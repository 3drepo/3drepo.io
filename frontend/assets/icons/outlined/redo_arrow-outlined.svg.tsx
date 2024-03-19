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
	<svg className={className} width="19" height="15" viewBox="0 0 19 15" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M14.3772 9.07247L18.3147 5.13497C18.5618 4.88784 18.5618 4.48716 18.3147 4.24003L14.3772 0.302534C14.13 0.0554053 13.7294 0.0554053 13.4822 0.302534C13.2351 0.549663 13.2351 0.950337 13.4822 1.19747L16.3394 4.05469H5.63228C5.51221 4.05469 4.26485 4.05467 3.02703 4.68634C2.39783 5.00742 1.75843 5.49811 1.27841 6.24322C0.796683 6.99097 0.5 7.95706 0.5 9.1875C0.5 11.9302 1.64931 13.4107 2.93803 14.1636C4.16915 14.8828 5.43317 14.8828 5.6313 14.8828H14.4922C14.8417 14.8828 15.125 14.5995 15.125 14.25C15.125 13.9005 14.8417 13.6172 14.4922 13.6172H5.63281C5.49111 13.6172 4.50847 13.6153 3.57647 13.0708C2.6989 12.5581 1.76562 11.5073 1.76562 9.1875C1.76562 8.16794 2.00873 7.44653 2.34236 6.92865C2.67769 6.40814 3.12922 6.05508 3.60231 5.81366C4.56718 5.32128 5.56792 5.32031 5.63281 5.32031H16.3394L13.4822 8.17753C13.2351 8.42466 13.2351 8.82534 13.4822 9.07247C13.7294 9.31959 14.13 9.31959 14.3772 9.07247Z" fill="currentColor"/>
	</svg>
);
