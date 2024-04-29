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
	<svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<g className="highlight">
			<path d="M15.6189 9.79034H16.2578V9.06152L16.1551 9.17818L15.6189 9.79034Z" fill="currentColor" />
			<path d="M16.2578 12.6717V11.231H14.9922V12.4085L14.2762 13.1201L15.1684 14.0178L16.0711 13.1206C16.1906 13.0018 16.2578 12.8402 16.2578 12.6717Z" fill="currentColor" />
			<path d="M14.2658 14.9149L13.4461 15.7297C13.3328 15.9008 13.1386 16.0137 12.918 16.0137H11.5996V14.7481H12.2852V14.4053H12.9832L13.3736 14.0173L14.2658 14.9149Z" fill="currentColor" />
			<path d="M4.375 10.1602V10.503H5.64062V10.1602H4.375Z" fill="currentColor" />
			<path d="M13.5508 10.1602V10.503H12.2852V10.1602H13.5508Z" fill="currentColor" />
			<path d="M13.5508 13.4297V11.4785H12.2852V13.4297H13.5508Z" fill="currentColor" />
			<path d="M4.375 13.4297V11.4785H5.64062V13.4297H4.375Z" fill="currentColor" />
			<path d="M4.375 14.4053V15.3809C4.375 15.5487 4.44167 15.7097 4.56035 15.8284C4.67902 15.947 4.83998 16.0137 5.00781 16.0137H6.32617V14.7481H5.64062V14.4053H4.375Z" fill="currentColor" />
			<path d="M10.2812 16.0137H7.64453V14.7481H10.2812V16.0137Z" fill="currentColor" />
		</g>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M17.077 6.20508H16.2578V4.93945H18.4727C18.721 4.93945 18.9464 5.08474 19.049 5.31094C19.1516 5.53714 19.1123 5.80243 18.9487 5.98925L15.484 9.94433C15.3638 10.0815 15.1903 10.1602 15.008 10.1602H1.52735C1.27899 10.1602 1.05358 10.0149 0.951019 9.78867C0.848455 9.56247 0.887695 9.29718 1.05135 9.11036L4.375 5.32617V7.25098L2.92299 8.89453H14.721L17.077 6.20508Z"
			fill="currentColor"
		/>
		<path
			className="highlight"
			fillRule="evenodd"
			clipRule="evenodd"
			d="M7.31825 1.49414C7.15018 1.49414 6.98901 1.561 6.87029 1.67998L4.55987 3.99547C4.43855 4.11706 4.3744 4.27966 4.375 4.44491L4.375 4.44727V8.89453H5.64062V5.08008H12.2842V8.2793L12.2852 8.89453H13.5508V4.75445L14.9922 3.50958V8.58499L15.4396 8.07427L16.2578 7.13672V2.12695C16.2578 1.77746 15.9745 1.49414 15.625 1.49414H7.31825ZM13.9241 2.75977L12.7084 3.80964H6.53321L7.58078 2.75977H13.9241Z"
			fill="currentColor"
		/>
	</svg>
);
