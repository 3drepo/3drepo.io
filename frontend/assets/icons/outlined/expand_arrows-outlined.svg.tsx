/**
 *  Copyright (C) 2026 3D Repo Ltd
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
	<svg xmlns="http://www.w3.org/2000/svg" width="18" height="8" viewBox="0 0 1024 432" fill="none" className={className}>
		<path d="M782.544 61.4558C768.485 47.397 768.485 24.603 782.544 10.5442C796.603 -3.51472 819.397 -3.51472 833.456 10.5442L1013.46 190.544C1020.21 197.295 1024 206.452 1024 216C1024 225.548 1020.21 234.705 1013.46 241.456L833.456 421.456C819.397 435.515 796.603 435.515 782.544 421.456C768.485 407.397 768.485 384.603 782.544 370.544L899.088 254H124.599L241.42 370.491C255.499 384.53 255.531 407.324 241.492 421.403C227.453 435.482 204.659 435.514 190.58 421.475L22.6309 254H21V252.374L10.5802 241.983C3.80684 235.229 0 226.057 0 216.492C0 206.926 3.80684 197.754 10.5802 191L190.58 11.5082C204.659 -2.5308 227.453 -2.49856 241.492 11.5802C255.531 25.6589 255.499 48.4529 241.42 62.4918L121.573 182H903.088L782.544 61.4558Z" fill="currentColor"></path>
	</svg>
);
