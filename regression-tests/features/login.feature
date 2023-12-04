#  Copyright (C) 2023 3D Repo Ltd
#  
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU Affero General Public License as
#  published by the Free Software Foundation, either version 3 of the
#  License, or (at your option) any later version.
#  
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU Affero General Public License for more details.
#  
#  You should have received a copy of the GNU Affero General Public License
#  along with this program.  If not, see <http://www.gnu.org/licenses/>.

Feature: Login
	Scenario: Going to default page should redirect to v5 login page
		Given Im not logged in
		When I navigate to '/'
		Then I should be redirected to the 'login' page
	
	Scenario: Going to page that requires authentication should redirect back to login page
		Given Im not logged in 
		When I navigate to the 'dashboard' page
		Then I should be redirected to the 'login' page

	Scenario: You can log into 3D Repo with a valid username and password
		Given I navigate to the 'login' page
		When I sign in as 'viewer'
		Then I should be redirected to the 'dashboard' page

	Scenario: Upon log in, you should be redirected to the page you wish to go
		Given Im not logged in 
		And I navigate to the 'viewer teamspace settings' page
		When I sign in as 'viewer'
		Then I should be redirected to the 'viewer teamspace settings' page