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
	className?: string;
};

export default ({ className }: IProps) => (
	<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none" className={className}>
		<path d="M14 0C6.26875 0 0 6.26875 0 14C0 21.7312 6.26875 28 14 28C21.7312 28 28 21.7312 28 14C28 6.26875 21.7312 0 14 0ZM18.5031 14.2156L11.6781 19.1812C11.6407 19.2081 11.5966 19.2242 11.5507 19.2276C11.5047 19.2311 11.4587 19.2218 11.4177 19.2008C11.3767 19.1798 11.3422 19.1479 11.3182 19.1087C11.2941 19.0694 11.2813 19.0242 11.2812 18.9781V9.05313C11.2811 9.00696 11.2937 8.96165 11.3178 8.92222C11.3418 8.8828 11.3762 8.85079 11.4173 8.82976C11.4584 8.80873 11.5046 8.79948 11.5506 8.80305C11.5966 8.80663 11.6408 8.82288 11.6781 8.85L18.5031 13.8125C18.5354 13.8353 18.5617 13.8655 18.5798 13.9006C18.598 13.9357 18.6075 13.9746 18.6075 14.0141C18.6075 14.0536 18.598 14.0925 18.5798 14.1275C18.5617 14.1626 18.5354 14.1928 18.5031 14.2156Z" fill="currentColor" />
	</svg>
);
