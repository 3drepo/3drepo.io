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
	<svg className={className} width="19" height="17" viewBox="0 0 19 17" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M1.42673 8.08128C0.191091 9.31692 0.191088 11.3203 1.42673 12.5559L4.64229 15.7715C5.23567 16.3649 6.04046 16.6982 6.87962 16.6982H17.6624C18.0119 16.6982 18.2952 16.4149 18.2952 16.0654C18.2952 15.7159 18.0119 15.4326 17.6624 15.4326H11.1754L17.0688 9.53922C18.3044 8.30358 18.3044 6.30021 17.0688 5.06457L12.9934 0.989231C11.7578 -0.246412 9.75442 -0.246409 8.51878 0.989233L1.42673 8.08128ZM12.3187 12.4994L9.38553 15.4326H6.87962C6.37612 15.4326 5.89325 15.2326 5.53722 14.8766L2.32166 11.661C1.58028 10.9196 1.58028 9.7176 2.32167 8.97621L5.55861 5.73927L12.3187 12.4994ZM13.2137 11.6045L16.1738 8.64429C16.9152 7.90291 16.9152 6.70088 16.1738 5.9595L12.0985 1.88416C11.3571 1.14278 10.1551 1.14278 9.41371 1.88417L6.45354 4.84434L13.2137 11.6045Z" fill="currentColor"/>
	</svg>
);
