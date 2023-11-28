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
		<g className="reset-o">
			<path
				className="primary"
				d="M2.24353 0.633708C2.24402 0.284215 1.9611 0.000494974 1.61161 6.4627e-07C1.26212 -0.00049348 0.9784 0.282425 0.977905 0.631918L0.971916 4.86679C0.971678 5.03493 1.03837 5.19625 1.15726 5.31515C1.27616 5.43404 1.43748 5.50073 1.60562 5.50049L5.84049 5.4945C6.18999 5.49401 6.4729 5.21029 6.47241 4.8608C6.47192 4.5113 6.1882 4.22839 5.8387 4.22888L2.91197 4.23302C3.79771 3.10184 4.98764 2.23189 6.35537 1.73406C8.17429 1.07201 10.1754 1.11625 11.9633 1.85805C13.7511 2.59985 15.1958 3.98525 16.0117 5.74053C16.8277 7.4958 16.9556 9.49328 16.3703 11.3383C15.7849 13.1833 14.5288 14.7417 12.8502 15.7056C11.1715 16.6694 9.19246 16.9686 7.30394 16.544C5.41542 16.1194 3.75483 15.0019 2.65027 13.4123C1.66672 11.9969 1.18774 10.2989 1.27863 8.58963C1.29722 8.24005 1.05698 7.92048 0.710098 7.87333C0.363216 7.82619 0.0414404 8.06922 0.0188138 8.41856C-0.112308 10.443 0.444509 12.4596 1.60921 14.1357C2.89487 15.9859 4.82771 17.2866 7.02586 17.7808C9.22401 18.275 11.5276 17.9268 13.4814 16.8049C15.4353 15.6831 16.8973 13.8692 17.5786 11.7217C18.26 9.57416 18.111 7.24919 17.1613 5.20613C16.2116 3.16307 14.5301 1.55054 12.4491 0.687117C10.3681 -0.176302 8.03891 -0.227802 5.92177 0.542794C4.49213 1.06315 3.2294 1.93282 2.2401 3.05831L2.24353 0.633708Z"
				fill="currentColor"
			/>
		</g>
	</svg>
);
