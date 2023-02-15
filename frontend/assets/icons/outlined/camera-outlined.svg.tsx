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
	<svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M9.87178 2.92383L9.14717 1.0918L4.8622 1.0918L4.16494 2.92383H0.984375V10.9082H13.0156V2.92383H9.87178ZM0.984424 2.9226L0.98442 2.92264C0.984426 2.92258 0.984429 2.92257 0.984424 2.9226ZM3.48633 1.93945H0.984375C0.44072 1.93945 0 2.38017 0 2.92383V10.9082C0 11.4519 0.44072 11.8926 0.984375 11.8926H13.0156C13.5593 11.8926 14 11.4519 14 10.9082V2.92383C14 2.38017 13.5593 1.93945 13.0156 1.93945H10.541L10.0625 0.729745C9.91399 0.354153 9.55108 0.107422 9.14717 0.107422H4.8622C4.45364 0.107422 4.08754 0.359803 3.94221 0.74165L3.48633 1.93945Z"
			fill="currentColor"
		/>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M7 8.35156C7.90609 8.35156 8.64062 7.61703 8.64062 6.71094C8.64062 5.80485 7.90609 5.07031 7 5.07031C6.09391 5.07031 5.35938 5.80485 5.35938 6.71094C5.35938 7.61703 6.09391 8.35156 7 8.35156ZM7 9.33594C8.44975 9.33594 9.625 8.16069 9.625 6.71094C9.625 5.26119 8.44975 4.08594 7 4.08594C5.55025 4.08594 4.375 5.26119 4.375 6.71094C4.375 8.16069 5.55025 9.33594 7 9.33594Z"
			fill="currentColor"
		/>
	</svg>
);
