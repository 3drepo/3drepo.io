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
	<svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M17.3161 1.2968C17.316 0.957581 17.041 0.682617 16.7018 0.682617L1.2959 0.682617C0.956636 0.682617 0.681643 0.957647 0.681643 1.29688V3.84664C0.681643 4.00955 0.746359 4.16579 0.861549 4.28098L6.68575 10.1053L6.68574 15.849C6.68574 16.1309 6.87759 16.3766 7.15102 16.4449L10.5487 17.2944C10.9364 17.3913 11.312 17.0981 11.312 16.6985L11.312 10.1053L17.1365 4.28099C17.2517 4.16577 17.3164 4.0095 17.3164 3.84656L17.3161 1.2968ZM16.1208 1.87793L16.1211 3.60599L10.2966 9.43027C10.1814 9.54547 10.1167 9.70171 10.1167 9.86462L10.1167 15.9543L7.88105 15.3953L7.88106 9.86462C7.88106 9.70171 7.81634 9.54548 7.70115 9.43028L1.87695 3.60596V1.87793L16.1208 1.87793Z" fill="currentColor"/>
	</svg>
);
