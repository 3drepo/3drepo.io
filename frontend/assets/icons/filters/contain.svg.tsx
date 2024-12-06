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
	<svg className={className} width="7" height="8" viewBox="0 0 7 8" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path fillRule="evenodd" clipRule="evenodd" d="M0.308594 4C0.308594 1.93446 1.98305 0.260002 4.04859 0.260002H6.24859C6.55235 0.260002 6.79859 0.506245 6.79859 0.810002C6.79859 1.11376 6.55235 1.36 6.24859 1.36H4.04859C2.59056 1.36 1.40859 2.54197 1.40859 4C1.40859 5.45803 2.59056 6.64 4.04859 6.64H6.24859C6.55235 6.64 6.79859 6.88624 6.79859 7.19C6.79859 7.49376 6.55235 7.74 6.24859 7.74H4.04859C1.98305 7.74 0.308594 6.06555 0.308594 4Z" fill="currentColor"/>
	</svg>
);