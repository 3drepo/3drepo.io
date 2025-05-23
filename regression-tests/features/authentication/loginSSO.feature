#  Copyright (C) 2024 3D Repo Ltd
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

Feature: Login (SSO)
	Scenario: Signing in with Microsoft
		Given I navigate to '/'
		Then I click on 'Sign in with Microsoft'
		When I sign in at Microsoft with:
			| Email                     | Password      |
  			| homerJSimpson@outlook.com | homerJSimpson |
		Then I should be redirected to the 'dashboard' page
	
	Scenario: Signing in with Microsoft with non existing account
		Given I navigate to '/'
		Then I click on 'Sign in with Microsoft'
		When I sign in at Microsoft with:
			| Email                                 | Password      |
  			| unregisteredHomerJSimpson@outlook.com | homerJSimpson |
		Then I wait until "You are not registered with 3D Repo" text appears
	
	Scenario: Signing in with Microsoft with an account not linked to SSO
		Given I navigate to '/'
		Then I click on 'Sign in with Microsoft'
		When I sign in at Microsoft with:
			| Email                              | Password      |
  			| othermailHomerJSimpson@outlook.com | homerJSimpson |
		Then I wait until "This email is associated with an account that is not linked with Microsoft." text appears
