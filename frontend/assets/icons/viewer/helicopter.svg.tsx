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
	<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<g className='primary'>
			<path
				fillRule="evenodd"
				clipRule="evenodd" d="M0.544922 2.22363C0.544922 1.87414 0.828242 1.59082 1.17773 1.59082H16.9717C17.3212 1.59082 17.6045 1.87414 17.6045 2.22363C17.6045 2.57313 17.3212 2.85645 16.9717 2.85645H9.70312V5.90822H13.4632C15.7455 5.90822 17.5957 7.75839 17.5957 10.0407C17.5957 12.2425 15.8108 14.0273 13.6091 14.0273H9.2206C8.99629 14.0273 8.78874 13.9086 8.67507 13.7152L6.55119 10.1024L1.37311 8.39113C1.16993 8.32398 1.01445 8.1587 0.959835 7.9518L0.0912772 4.66151C0.0411693 4.47169 0.0820001 4.26937 0.201802 4.11384C0.321605 3.95831 0.506808 3.86719 0.703131 3.86719H2.96325C3.16043 3.86719 3.34634 3.9591 3.46606 4.11577L4.83577 5.90822H8.4375V2.85645H1.17773C0.828242 2.85645 0.544922 2.57313 0.544922 2.22363ZM2.09598 7.29708L1.52467 5.13281H2.65039L4.0201 6.92526C4.13982 7.08193 4.32574 7.17384 4.52292 7.17384H13.4632C15.0466 7.17384 16.3301 8.45738 16.3301 10.0407C16.3301 11.5435 15.1118 12.7617 13.6091 12.7617H9.58264L7.52151 9.25566C7.44368 9.12327 7.32037 9.0237 7.17455 8.97551L2.09598 7.29708Z"
				fill="currentColor"
			/>
			<path
				d="M17.7891 15.416C17.7891 15.0665 17.5057 14.7832 17.1562 14.7832C16.8068 14.7832 16.5234 15.0665 16.5234 15.416V16.0312H7.1543C6.8048 16.0312 6.52148 16.3146 6.52148 16.6641C6.52148 17.0136 6.8048 17.2969 7.1543 17.2969H17.1562C17.5057 17.2969 17.7891 17.0136 17.7891 16.6641V15.416Z"
				fill="currentColor"
			/>
		</g>
	</svg>
);
