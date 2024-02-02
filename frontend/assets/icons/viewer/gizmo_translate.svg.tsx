/**
 *  Copyright (C) 2023 3D Repo Ltd
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
	<svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<g id="move-cube-o">
			<path className="primary" fillRule="evenodd" clipRule="evenodd" d="M8.78669 3.58179C8.95301 3.50789 9.14285 3.50789 9.30916 3.58179L15.4872 6.32688C15.7195 6.43012 15.8693 6.66054 15.8693 6.91481V14.463C15.8693 14.7172 15.7195 14.9477 15.4872 15.0509L9.30916 17.796C9.14285 17.8699 8.95301 17.8699 8.78669 17.796L2.60868 15.0509C2.37633 14.9477 2.22656 14.7173 2.22656 14.463V6.91481C2.22656 6.66054 2.37632 6.43013 2.60868 6.32688L8.78669 3.58179ZM9.04793 4.85065L3.49219 7.31925V14.0585L9.04793 16.5271L14.6037 14.0585V7.31925L9.04793 4.85065Z" fill="currentColor"/>
			<path className="highlight" d="M8.87735 1.18653C9.01509 1.04655 9.2408 1.04655 9.37853 1.18653L11.2376 3.0759C11.4563 3.29818 11.2989 3.67404 10.987 3.67404L9.68165 3.67404V10.6036L15.8016 14.1375L16.4604 12.9964C16.6163 12.7264 17.0206 12.7779 17.1037 13.0785L17.8104 15.6332C17.8628 15.8225 17.7499 16.0179 17.5598 16.0672L14.994 16.7326C14.6922 16.8108 14.4454 16.4865 14.6013 16.2165L15.1688 15.2336L9.05023 11.7005L2.83111 15.2729L3.43676 16.3219C3.59268 16.592 3.34591 16.9163 3.04405 16.838L0.478255 16.1727C0.288158 16.1234 0.175304 15.9279 0.227663 15.7387L0.934361 13.1839C1.0175 12.8834 1.42174 12.8318 1.57766 13.1019L2.1983 14.1769L8.41603 10.6052V3.67404L7.26884 3.67404C6.957 3.67404 6.79954 3.29818 7.01825 3.0759L8.87735 1.18653Z" fill="currentColor"/>
		</g>
	</svg>
);
