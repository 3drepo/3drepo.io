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
		<path fillRule="evenodd" clipRule="evenodd" d="M10.8008 0C10.1018 0 9.53516 0.56664 9.53516 1.26562V2.25H1.76562C1.06664 2.25 0.5 2.81664 0.5 3.51562V16.7344C0.5 17.4334 1.06664 18 1.76562 18H14.9844C15.6834 18 16.25 17.4334 16.25 16.7344V8.96484H17.2344C17.9334 8.96484 18.5 8.3982 18.5 7.69922V1.26562C18.5 0.56664 17.9334 0 17.2344 0H10.8008ZM17.2344 1.26562H10.8008V7.69922H17.2344V1.26562ZM1.76562 3.51562H9.53516V8.01719L5.15019 12.4022C4.90306 12.6493 4.90306 13.05 5.15019 13.2971C5.39732 13.5442 5.79799 13.5442 6.04512 13.2971L10.3774 8.96484H14.9844V16.7344H1.76562L1.76562 3.51562Z" fill="currentColor" />
	</svg>
);