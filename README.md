3drepo.io ![](https://travis-ci.org/3drepo/3drepo.io.svg?branch=master)
=========

3DRepo is a web based front end for viewing version controlled 3D data stored in a MongoDB. Getting data into the database is controlled by the 3D Repo Core library and GUI separate projects hosted here on GitHub ([3DRepoCore][], [3DRepoGUI][])

## License
This project is Copyright of [3D Repo Ltd](http://3drepo.org) and is released under the open source [GNU Affero General Public License v3](http://www.gnu.org/licenses/agpl-3.0.en.html). Should you require a commercial license, please contact [support@3drepo.org](mailto:support@3drepo.org)

Installation
------------

Note: If using windows, please ensure cmd.exe was invoked as adminstrator (Right click -> Run as administrator)

1. Clone the repository: `git clone https://github.com/3drepo/3drepo.io.git`
2. Change directory: `cd 3drepo.io`
3. (Optional) Update submodules: `git submodule update --init --recursive`
4. Configure the system as below.
5. Ensure [Python v2](https://www.python.org/) and [Node.js](https://nodejs.org/).
5. Install the required dependencies: `npm install`  

Configuration
-------------

The configuration files are contained in the subdirectory config under the main project directory. 
Each directory in config represents a different configuration you can run under. This allows you to quickly switch between, for example, a development environment and a production environment. These both contain a file call config_sample.js that needs to be copied or renamed to config.js for it to work.

In general, to configure a new configuration enviroment called <config_name>:
 
1. Change to the configuration directory: `cd config`
2. First create a new directory under config: `mkdir <config_name>`
3. Copy config\_sample.js from dev to the directory as config.js: `cp config_sample.js <config_name>/config.js`
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

Contact
-------

If you need any help or want to contribute please contact: `support@3drepo.org`
We look forward to hearing from you.

[3DRepoCore]: https://github.com/3drepo/3drepocore
[3DRepoGUI]: https://github.com/3drepo/3drepogui
