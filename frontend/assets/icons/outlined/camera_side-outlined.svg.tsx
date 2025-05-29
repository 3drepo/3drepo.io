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
	onClick?: () => void;
};

export default (props: IProps) => (
	<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
		<path d="M2.28516 7.03711C2.05216 7.03711 1.86328 7.22599 1.86328 7.45898C1.86328 7.69198 2.05216 7.88086 2.28516 7.88086H4.51172C4.74471 7.88086 4.93359 7.69198 4.93359 7.45898C4.93359 7.22599 4.74471 7.03711 4.51172 7.03711H2.28516Z" fill="currentColor"/>
		<path fillRule="evenodd" clipRule="evenodd" d="M0.667969 2.25C0.667969 2.017 0.856849 1.82812 1.08984 1.82812H5.09173C5.20429 1.82812 5.31218 1.87311 5.39141 1.95306L6.78014 3.35459C6.80316 3.37781 6.82292 3.40304 6.83943 3.4297H7.85234C8.08922 3.4297 8.28125 3.62173 8.28125 3.85861V4.79125L11.4164 3.57898C11.6974 3.47031 12 3.67769 12 3.97902V9.21894C12 9.51998 11.698 9.72733 11.4171 9.61924L8.28125 8.41273V9.33934C8.28125 9.57619 8.08925 9.76824 7.85234 9.76824H0.428906C0.192014 9.76824 0 9.5762 0 9.33934V3.85861C0 3.62176 0.191999 3.4297 0.428906 3.4297H0.667969V2.25ZM4.91585 2.67188L5.66676 3.4297H1.51172V2.67188H4.91585ZM0.84375 4.27345V8.92449H7.4375V7.85473C7.43222 7.81681 7.43207 7.77786 7.4375 7.73892V5.46617C7.43207 5.42724 7.43222 5.38829 7.4375 5.35037V4.27345H0.84375ZM8.28125 5.69588V7.50869L11.1562 8.61484V4.58421L8.28125 5.69588Z" fill="currentColor"/>
	</svg>
);
