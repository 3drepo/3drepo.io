3drepo.io ![](https://travis-ci.org/3drepo/3drepo.io.svg?branch=master)
=========

3drepo.io is a web based front end for viewing version controlled 3D data stored in a MongoDB. Getting data into the database is controlled by the 3D Repo Core library and GUI separate projects hosted here on GitHub ([3DRepoCore][], [3DRepoGUI][])

## License
This project is Copyright of [3D Repo Ltd](http://3drepo.org) and is released under the open source [GNU Affero General Public License v3](http://www.gnu.org/licenses/agpl-3.0.en.html). Should you require a commercial license, please contact [support@3drepo.org](mailto:support@3drepo.org)

Installation
------------

Note: If using windows, please ensure cmd.exe was invoked as adminstrator (i.e. Right click -> Run as Administrator).

1. Clone the repository: `git clone https://github.com/3drepo/3drepo.io.git`
2. Change directory: `cd 3drepo.io`
3. Update submodules: `git submodule update --init`
4. Configure the system as below.
5. Ensure [Python v2](https://www.python.org/) and [Node.js](https://nodejs.org/) are installed.
5. Install the required dependencies: `npm install`  

Configuration
-------------

The configuration files are contained in the subdirectory config under the main project directory. 
Each directory in config represents a different configuration you can run under. This allows you to quickly switch between, for example, a development environment and a production environment. These both contain a file call config_sample.js that needs to be copied or renamed to config.js for it to work.

In general, to configure a new configuration enviroment called <config_name>:
 
1. Change to the configuration directory: `cd config`
2. First create a new directory under config: `mkdir <config_name>`
3. Copy config\_sample.js to the new directory as config.js: `cp config_sample.js <config_name>/config.js`
4. Edit config.js as described in [Configuration File](https://github.com/3drepo/3drepo.io/wiki/Configuration-File)

Running the application
-----------------------

The repository includes a script `run_app` and `run_app.cmd` specifically for Windows to run the server. It has two arguments:

**./run_app \<config\> \<debug\>**
* **config** This is the directory under config that the configuration resides in
* **debug** Type debug here for node.js debugging, or leave it out for none.
  
Typically you will want to run the server using forever (install with `npm -g install forever` under the superuser account):

**./forever_app \<config\>**
* **config** This is the directory under config that the configuration resides in

The script may complain that you don't have access to the ports (EACCESS), in which case you need to set-up ip-routing under the `su` account.

`iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080`

Although, this depends on the type of server/application you are running.

Locally running the application
-------------------------------

The application requires the use of cookies for tracking user authentication. Some browsers do not
allow the use of cookies for the localhost domain. To circumvent this problem, use need to associate
a hostname with the loopback address (127.0.0.1)

For both Windows and Linux you must edit the hosts file to add a manual DNS entry for a hostname. This will 
redirect any requests to the hostname to the loopback address. In our example, we use `example.org` which is customary.

For Windows, you must use an Administrator notepad to edit the file:

`C:\Windows\System32\Drivers\etc\hosts`

For Linux, you must edit the file with Administrator privileges:

`sudo nano /etc/hosts`

Within this file you must append to, or create, a line for the entry for example:

`127.0.0.1 localhost example.org`

In the configuration file for the server, you then set hostname to `example.org` or whatever host you have redirected.

Contact
-------

If you need any help or want to contribute please contact: `support@3drepo.org`
We look forward to hearing from you.

[3DRepoCore]: https://github.com/3drepo/3drepocore
[3DRepoGUI]: https://github.com/3drepo/3drepogui
