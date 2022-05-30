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
	<svg
		width="36"
		height="36"
		viewBox="0 0 36 36"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
	>
		<path
			d="M16.7872 18.8545L4.77783 9.51699L3.81104 8.76465L4.78135 9.52051V27.8439H31.2188V9.52051L19.2024 18.8545C18.8571 19.1228 18.4322 19.2685 17.9948 19.2685C17.5575 19.2685 17.1326 19.1228 16.7872 18.8545Z"
			fill="#E6F9FB"
		/>
		<path
			d="M30.8076 6.98926L32.1893 8.76464L31.2189 9.52049L32.1928 8.76464L30.8111 6.98926H30.8076Z"
			fill="#E6F9FB"
		/>
		<path
			d="M32.625 5.625H3.375C2.75273 5.625 2.25 6.12773 2.25 6.75V29.25C2.25 29.8723 2.75273 30.375 3.375 30.375H32.625C33.2473 30.375 33.75 29.8723 33.75 29.25V6.75C33.75 6.12773 33.2473 5.625 32.625 5.625ZM29.3027 8.15977L18 16.9453L6.69727 8.15977H29.3027ZM31.2188 9.52031V27.8438H4.78125V9.52031L3.81094 8.76445L4.77773 9.5168L16.7871 18.8543C17.1325 19.1226 17.5574 19.2683 17.9947 19.2683C18.4321 19.2683 18.857 19.1226 19.2023 18.8543L31.2188 9.52031L32.1891 8.76445L30.8074 6.98906H30.8109L32.1926 8.76445L31.2188 9.52031Z"
			fill="#00C1D4"
		/>
	</svg>
);
