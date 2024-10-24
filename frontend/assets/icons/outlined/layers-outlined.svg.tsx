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
	<svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path fillRule="evenodd" clipRule="evenodd" d="M9.40846 0.503925C9.78649 0.326816 10.2237 0.326817 10.6017 0.503925L19.6053 4.72222C20.148 4.97646 20.1442 5.74953 19.5991 5.9985L10.5893 10.1138C10.2183 10.2833 9.79188 10.2833 9.42082 10.1138L0.410998 5.9985C-0.134088 5.74953 -0.137829 4.97646 0.404821 4.72222L9.40846 0.503925ZM10.0051 1.77734L17.6324 5.35083L10.0051 8.83466L2.37774 5.35083L10.0051 1.77734Z" fill="currentColor"/>
		<path d="M2.46854 8.47433L0.409894 9.43883C-0.132756 9.69306 -0.129014 10.4661 0.416072 10.7151L9.42589 14.8304C9.79696 14.9999 10.2233 14.9999 10.5944 14.8304L19.6042 10.7151C20.1493 10.4661 20.153 9.69306 19.6104 9.43883L17.5467 8.47198L15.8684 9.23859L17.6375 10.0674L10.0101 13.5513L2.38282 10.0674L4.1469 9.24094L2.46854 8.47433Z" fill="currentColor"/>
		<path d="M2.46854 13.1469L0.409895 14.1114C-0.132755 14.3656 -0.129014 15.1387 0.416072 15.3876L9.42589 19.5029C9.79696 19.6724 10.2233 19.6724 10.5944 19.5029L19.6042 15.3876C20.1493 15.1387 20.153 14.3656 19.6104 14.1114L17.5467 13.1445L15.8684 13.9111L17.6375 14.74L10.0101 18.2238L2.38282 14.74L4.1469 13.9135L2.46854 13.1469Z" fill="currentColor"/>
	</svg>
);
