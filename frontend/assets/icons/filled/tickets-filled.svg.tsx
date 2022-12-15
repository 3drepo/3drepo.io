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
	className?: string,
};

export default ({ className }: IProps) => (
	<svg width="17" height="17" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path d="M568.875 72C568.875 32.2355 601.111 0 640.875 0H951.986C991.751 0 1023.99 32.2355 1023.99 72V383.111C1023.99 422.876 991.751 455.111 951.986 455.111H640.875C601.11 455.111 568.875 422.876 568.875 383.111V72Z" fill="currentColor" />
		<path d="M0 72C0 32.2355 32.2355 0 72 0H383.111C422.876 0 455.111 32.2355 455.111 72V383.111C455.111 422.876 422.876 455.111 383.111 455.111H72C32.2355 455.111 0 422.876 0 383.111V72Z" fill="currentColor" />
		<path d="M0 640.801C0 601.036 32.2355 568.801 72 568.801H383.111C422.876 568.801 455.111 601.036 455.111 640.801V951.912C455.111 991.676 422.876 1023.91 383.111 1023.91H72C32.2355 1023.91 0 991.676 0 951.912V640.801Z" fill="currentColor" />
		<path fillRule="evenodd" clipRule="evenodd" d="M796.438 589.867C816.32 589.867 832.438 605.985 832.438 625.867V967.201C832.438 987.083 816.32 1003.2 796.438 1003.2C776.555 1003.2 760.438 987.083 760.438 967.201V625.867C760.438 605.985 776.555 589.867 796.438 589.867Z" fill="currentColor" />
		<path fillRule="evenodd" clipRule="evenodd" d="M1003.12 796.535C1003.12 816.417 987.007 832.535 967.125 832.535L625.792 832.535C605.909 832.535 589.792 816.417 589.792 796.535C589.792 776.653 605.909 760.535 625.792 760.535L967.125 760.535C987.007 760.535 1003.12 776.653 1003.12 796.535Z" fill="currentColor" />
	</svg>
);
