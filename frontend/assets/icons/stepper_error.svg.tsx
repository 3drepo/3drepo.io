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
		<g clipPath="url(#clip0_806_7949)">
			<path
				d="M16.0724 26.3571C16.0724 26.8686 16.2756 27.3592 16.6373 27.7208C16.999 28.0825 17.4895 28.2857 18.001 28.2857C18.5125 28.2857 19.003 28.0825 19.3647 27.7208C19.7264 27.3592 19.9296 26.8686 19.9296 26.3571C19.9296 25.8457 19.7264 25.3551 19.3647 24.9934C19.003 24.6318 18.5125 24.4286 18.001 24.4286C17.4895 24.4286 16.999 24.6318 16.6373 24.9934C16.2756 25.3551 16.0724 25.8457 16.0724 26.3571ZM16.7153 14.1429V21.5357C16.7153 21.7125 16.8599 21.8571 17.0367 21.8571H18.9653C19.1421 21.8571 19.2867 21.7125 19.2867 21.5357V14.1429C19.2867 13.9661 19.1421 13.8214 18.9653 13.8214H17.0367C16.8599 13.8214 16.7153 13.9661 16.7153 14.1429ZM35.8283 31.8214L19.114 2.89286C18.8649 2.46295 18.4349 2.25 18.001 2.25C17.5671 2.25 17.1332 2.46295 16.8881 2.89286L0.173786 31.8214C-0.32041 32.6813 0.298339 33.75 1.28673 33.75H34.7153C35.7037 33.75 36.3224 32.6813 35.8283 31.8214ZM4.34834 30.7004L18.001 7.06741L31.6537 30.7004H4.34834Z"
				fill="currentColor"
			/>
		</g>
		<defs>
			<clipPath id="clip0_806_7949">
				<rect width="36" height="36" fill="#fff" />
			</clipPath>
		</defs>
	</svg>
);
