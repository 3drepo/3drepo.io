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
		<path d="M0.685346 5.13497C0.438218 4.88784 0.438218 4.48716 0.685346 4.24003L4.62285 0.302534C4.86998 0.0554053 5.27065 0.0554053 5.51778 0.302534C5.76491 0.549663 5.76491 0.950337 5.51778 1.19747L2.66056 4.05469H13.3677C13.4878 4.05469 14.7351 4.05467 15.973 4.68634C16.6022 5.00742 17.2416 5.49811 17.7216 6.24322C18.2033 6.99097 18.5 7.95706 18.5 9.1875C18.5 11.9302 17.3507 13.4107 16.062 14.1636C14.8308 14.8828 13.5668 14.8828 13.3687 14.8828H4.50781C4.15832 14.8828 3.875 14.5995 3.875 14.25C3.875 13.9005 4.15832 13.6172 4.50781 13.6172H13.3672C13.5089 13.6172 14.4915 13.6153 15.4235 13.0708C16.3011 12.5581 17.2344 11.5073 17.2344 9.1875C17.2344 8.16794 16.9913 7.44653 16.6576 6.92865C16.3223 6.40814 15.8708 6.05508 15.3977 5.81366C14.4328 5.32128 13.4321 5.32031 13.3672 5.32031H2.66056L5.51778 8.17753C5.76491 8.42466 5.76491 8.82534 5.51778 9.07247C5.27065 9.31959 4.86998 9.31959 4.62285 9.07247L0.685346 5.13497Z" fill="currentColor"/>
	</svg>
);