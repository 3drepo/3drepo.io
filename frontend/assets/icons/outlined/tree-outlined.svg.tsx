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
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path fillRule="evenodd" clipRule="evenodd" d="M0 0.703125C0 0.3148 0.3148 0 0.703125 0H5C5.38833 0 5.70312 0.3148 5.70312 0.703125V2.12891H9.25302C10.0297 2.12891 10.6593 2.75851 10.6593 3.53516V9.28711H14.2969V7.85156C14.2969 7.46324 14.6117 7.14844 15 7.14844H19.2969C19.6852 7.14844 20 7.46324 20 7.85156V12.1484C20 12.5368 19.6852 12.8516 19.2969 12.8516H15C14.6117 12.8516 14.2969 12.5368 14.2969 12.1484V10.6934H10.6593V16.4453H14.2969V15C14.2969 14.6117 14.6117 14.2969 15 14.2969H19.2969C19.6852 14.2969 20 14.6117 20 15V19.2969C20 19.6852 19.6852 20 19.2969 20H15C14.6117 20 14.2969 19.6852 14.2969 19.2969V17.8516H10.6593C9.88262 17.8516 9.25302 17.222 9.25302 16.4453L9.25302 3.53516H5.70312V5C5.70312 5.38833 5.38833 5.70312 5 5.70312H0.703125C0.3148 5.70312 0 5.38833 0 5V0.703125ZM1.40625 1.40625V4.29688H4.29688V1.40625H1.40625ZM15.7031 8.55469V11.4453H18.5938V8.55469H15.7031ZM15.7031 18.5938V15.7031H18.5938V18.5938H15.7031Z" fill="currentColor"/>
	</svg>

);
