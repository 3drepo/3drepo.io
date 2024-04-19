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
		<g className="gps-o" clipPath="url(#clip0_1764_3841)">
			<path
				className="primary"
				fillRule="evenodd"
				clipRule="evenodd"
				d="M9 0.193359C9.34949 0.193359 9.63281 0.476679 9.63281 0.826172V2.038C12.9884 2.33911 15.6609 5.01155 15.962 8.36719H17.1738C17.5233 8.36719 17.8066 8.65051 17.8066 9C17.8066 9.34949 17.5233 9.63281 17.1738 9.63281H15.962C15.6608 12.9884 12.9884 15.6608 9.63281 15.9619V17.1738C9.63281 17.5233 9.34949 17.8067 9 17.8067C8.65051 17.8067 8.36719 17.5233 8.36719 17.1738V15.9619C5.01156 15.6608 2.33914 12.9884 2.03802 9.63281H0.826172C0.476679 9.63281 0.193359 9.34949 0.193359 9C0.193359 8.65051 0.476679 8.36719 0.826172 8.36719H2.03801C2.33911 5.01154 5.01155 2.3391 8.36719 2.038V0.826172C8.36719 0.476679 8.65051 0.193359 9 0.193359ZM9 3.27539C8.99833 3.27539 8.99667 3.27538 8.995 3.27537C5.83642 3.27806 3.27658 5.83883 3.27539 8.99776L3.27539 9L3.27539 9.00223C3.27661 12.1628 5.83913 14.7246 8.99999 14.7246C12.1616 14.7246 14.7246 12.1616 14.7246 8.99997C14.7246 5.84003 12.1643 3.27807 9.005 3.27537C9.00333 3.27538 9.00167 3.27539 9 3.27539Z"
				fill="currentColor"
			/>
			<circle
				className="primary"
				cx="9"
				cy="9"
				r="2.63672"
				fill="currentColor"
			/>
		</g>
		<defs>
			<clipPath className="primary">
				<rect width="18" height="18" fill="currentColor" />
			</clipPath>
		</defs>
	</svg>
);
