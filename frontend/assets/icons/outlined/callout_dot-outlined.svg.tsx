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
		<path fillRule="evenodd" clipRule="evenodd" d="M17.2344 8.96484H10.4301L4.15799 15.237C4.28077 15.4904 4.34961 15.7747 4.34961 16.0752C4.34961 17.1382 3.48784 18 2.4248 18C1.36176 18 0.5 17.1382 0.5 16.0752C0.5 15.0122 1.36176 14.1504 2.4248 14.1504C2.72528 14.1504 3.00967 14.2192 3.26307 14.342L9.53516 8.06994V1.26562C9.53516 0.56664 10.1018 0 10.8008 0H17.2344C17.9334 0 18.5 0.56664 18.5 1.26562V7.69922C18.5 8.3982 17.9334 8.96484 17.2344 8.96484ZM17.2344 1.26562H10.8008V7.69922H17.2344V1.26562Z" fill="currentColor"/>
	</svg>
);