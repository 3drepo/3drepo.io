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
	<svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path fillRule="evenodd" clipRule="evenodd" d="M4.55078 2.16211C4.55078 1.11363 5.40074 0.263672 6.44922 0.263672H11.6348C12.6832 0.263672 13.5332 1.11363 13.5332 2.16211V2.74219H16.3281C16.6776 2.74219 16.9609 3.02551 16.9609 3.375C16.9609 3.72449 16.6776 4.00781 16.3281 4.00781H15.7659L15.2862 15.5736C15.2299 16.9296 14.1143 18 12.7571 18H5.37961C4.02245 18 2.90678 16.9296 2.85054 15.5736L2.37085 4.00781H1.80859C1.4591 4.00781 1.17578 3.72449 1.17578 3.375C1.17578 3.02551 1.4591 2.74219 1.80859 2.74219H4.55078V2.16211ZM5.81641 2.74219H12.2676V2.16211C12.2676 1.81262 11.9843 1.5293 11.6348 1.5293H6.44922C6.09973 1.5293 5.81641 1.81262 5.81641 2.16211V2.74219ZM3.63756 4.00781L4.11508 15.5212C4.1432 16.1992 4.70103 16.7344 5.37961 16.7344H12.7571C13.4357 16.7344 13.9935 16.1992 14.0216 15.5212L14.4992 4.00781H3.63756Z" fill="currentColor"/>
	</svg>
);