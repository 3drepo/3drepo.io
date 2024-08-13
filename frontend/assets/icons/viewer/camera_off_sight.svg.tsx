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
	style?: React.CSSProperties;
};

export default ({ className, style }: IProps) => (
	<svg width="29" height="25" viewBox="0 0 29 25" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} >
		<rect x="4.41553" y="0.956787" width="24" height="24" rx="3" fill="#00C1D4"/>
		<rect x="0.415527" y="12.9568" width="6" height="6" transform="rotate(-45 0.415527 12.9568)" fill="#00C1D4"/>
		<g clip-path="url(#clip0_511_16090)">
			<path d="M12.0815 14.1667C11.8097 14.1667 11.5894 14.3871 11.5894 14.6589C11.5894 14.9308 11.8097 15.1511 12.0815 15.1511H14.6792C14.951 15.1511 15.1714 14.9308 15.1714 14.6589C15.1714 14.3871 14.951 14.1667 14.6792 14.1667H12.0815Z" fill="white"/>
			<path fill-rule="evenodd" clip-rule="evenodd" d="M10.1948 8.58179C10.1948 8.30996 10.4152 8.0896 10.687 8.0896H15.3559C15.4872 8.0896 15.6131 8.14208 15.7055 8.23536L17.3257 9.87047C17.3525 9.89757 17.3756 9.927 17.3949 9.95811H18.5766C18.853 9.95811 19.077 10.1821 19.077 10.4585V11.5466L22.7347 10.1323C23.0626 10.0055 23.4155 10.2474 23.4155 10.599V16.7122C23.4155 17.0634 23.0632 17.3053 22.7355 17.1792L19.077 15.7716V16.8527C19.077 17.129 18.853 17.3531 18.5766 17.3531H9.91592C9.63954 17.3531 9.41553 17.129 9.41553 16.8527V10.4585C9.41553 10.1822 9.63953 9.95811 9.91592 9.95811H10.1948V8.58179ZM15.1507 9.07397L16.0268 9.95811H11.1792V9.07397H15.1507ZM10.3999 10.9425V16.3687H18.0926V15.1206C18.0864 15.0764 18.0863 15.031 18.0926 14.9855V12.334C18.0863 12.2886 18.0864 12.2431 18.0926 12.1989V10.9425H10.3999ZM19.077 12.602V14.7169L22.4312 16.0074V11.305L19.077 12.602Z" fill="white"/>
		</g>
		<defs>
			<clipPath id="clip0_511_16090">
				<rect width="14" height="14" fill="white" transform="translate(9.41553 5.95679)"/>
			</clipPath>
		</defs>
	</svg>)
;