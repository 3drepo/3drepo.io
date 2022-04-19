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
	className?: string;
};

export default ({ className }: IProps) => (
	<svg width="33" height="37" viewBox="0 0 33 37" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path
			d="M16.5 18.1331C18.9046 18.1331 21.2107 17.1779 22.911 15.4776C24.6113 13.7773 25.5665 11.4712 25.5665 9.06657C25.5665 6.66197 24.6113 4.35585 22.911 2.65554C21.2107 0.955225 18.9046 0 16.5 0C14.0954 0 11.7892 0.955225 10.0889 2.65554C8.38862 4.35585 7.4334 6.66197 7.4334 9.06657C7.4334 11.4712 8.38862 13.7773 10.0889 15.4776C11.7892 17.1779 14.0954 18.1331 16.5 18.1331ZM5.49056 20.7236C4.28826 20.7236 3.1352 21.2012 2.28504 22.0514C1.43489 22.9015 0.957275 24.0546 0.957275 25.2569V25.9045C0.957275 29.004 2.9299 31.6255 5.73018 33.4077C8.546 35.2003 12.3578 36.2663 16.5 36.2663C20.6421 36.2663 24.4526 35.2003 27.2698 33.4077C30.07 31.6255 32.0427 29.004 32.0427 25.9045V25.2569C32.0427 24.6616 31.9254 24.0721 31.6976 23.5221C31.4698 22.9721 31.1358 22.4723 30.7149 22.0514C30.2939 21.6304 29.7942 21.2965 29.2442 21.0687C28.6942 20.8408 28.1047 20.7236 27.5094 20.7236H5.49056Z"
			fill="currentColor"
		/>
	</svg>
);
