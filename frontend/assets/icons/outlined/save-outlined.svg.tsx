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
	className?: string,
};

export default ({ className }: IProps) => (
	<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none" className={className}>
		<path fillRule="evenodd" clipRule="evenodd" d="M15.8116 0.5H4.1914C2.15269 0.5 0.5 2.1527 0.5 4.19141V17.8086C0.5 19.8473 2.1527 21.5 4.19141 21.5H17.8086C19.8473 21.5 21.5 19.8473 21.5 17.8086V6.18843C21.5 5.60102 21.2667 5.03767 20.8513 4.6223L17.3777 1.14871C16.9623 0.73335 16.399 0.5 15.8116 0.5ZM4.1914 1.97656C2.96818 1.97656 1.97656 2.96818 1.97656 4.19141V17.8086C1.97656 19.0044 2.92415 19.9788 4.10938 20.0219V13.5635C4.10938 12.3403 5.101 11.3486 6.32422 11.3486H15.6758C16.899 11.3486 17.8906 12.3403 17.8906 13.5635V20.0219C19.0758 19.9788 20.0234 19.0044 20.0234 17.8086V6.18843C20.0234 5.99263 19.9457 5.80485 19.8072 5.66639L16.3336 2.1928C16.1952 2.05435 16.0074 1.97656 15.8116 1.97656H15.6758V6.2627C15.6758 7.48592 14.6842 8.47754 13.4609 8.47754H8.53906C7.31584 8.47754 6.32422 7.48592 6.32422 6.2627V1.97656H4.1914ZM7.80078 1.97656H14.1992V6.2627C14.1992 6.67044 13.8687 7.00098 13.4609 7.00098H8.53906C8.13132 7.00098 7.80078 6.67044 7.80078 6.2627V1.97656ZM5.58594 13.5635C5.58594 13.1557 5.91648 12.8252 6.32422 12.8252H15.6758C16.0835 12.8252 16.4141 13.1557 16.4141 13.5635V20.0165H5.58594V13.5635Z" fill="currentColor"/>
	</svg>
);