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
	<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<g clipPath="url(#clip0_450_351)">
			<path fillRule="evenodd" clipRule="evenodd" d="M7.99219 1.14258C7.99219 0.87075 7.77183 0.650391 7.5 0.650391C7.22817 0.650391 7.00781 0.87075 7.00781 1.14258V2.08016C4.39422 2.31247 2.31247 4.39422 2.08016 7.00781H1.14258C0.87075 7.00781 0.650391 7.22817 0.650391 7.5C0.650391 7.77183 0.87075 7.99219 1.14258 7.99219H2.08098C2.31733 10.6015 4.39727 12.6786 7.00781 12.9107V13.8574C7.00781 14.1292 7.22817 14.3496 7.5 14.3496C7.77183 14.3496 7.99219 14.1292 7.99219 13.8574V12.9099C10.5984 12.6738 12.6738 10.5984 12.9099 7.99219H13.8574C14.1292 7.99219 14.3496 7.77183 14.3496 7.5C14.3496 7.22817 14.1292 7.00781 13.8574 7.00781H12.9107C12.6786 4.39727 10.6015 2.31733 7.99219 2.08098V1.14258ZM7.5 3.20703C7.77183 3.20703 7.99219 3.42739 7.99219 3.69922L7.99219 7.00781H11.3008C11.5726 7.00781 11.793 7.22817 11.793 7.5C11.793 7.77183 11.5726 7.99219 11.3008 7.99219H7.99219V11.3008C7.99219 11.5726 7.77183 11.793 7.5 11.793C7.22817 11.793 7.00781 11.5726 7.00781 11.3008V7.99219L3.69922 7.99219C3.42739 7.99219 3.20703 7.77183 3.20703 7.5C3.20703 7.22817 3.42739 7.00781 3.69922 7.00781L7.00781 7.00781L7.00781 3.69922C7.00781 3.42739 7.22817 3.20703 7.5 3.20703Z" fill="currentColor"/>
		</g>
		<defs>
			<clipPath id="clip0_450_351">
				<rect width="14" height="14" fill="white" transform="translate(0.5 0.5)"/>
			</clipPath>
		</defs>
	</svg>
);