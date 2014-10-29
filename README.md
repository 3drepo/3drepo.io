3drepo.io
=========

3DRepo is a web based front end for viewing version controlled 3D data stored in a MongoDB. Getting data into the database is controlled by the 3D Repo Core library and GUI separate projects hosted here on GitHub ([3DRepoCore][], [3DRepoGUI][])

Installation
------------

1. Clone the repository: `git clone https://github.com/3drepo/3drepo.io.git`
2. Change directory: `cd 3drepo.io`
3. (Optional) Update submodules: `git submodule update --init --recursive`
4. Configure the system as below.
5. Install the required dependencies: `npm install`

Configuration
-------------

The configuration files are contained in the subdirectory config under the main project directory. 
Each directory in config represents a different configuration you can run under. This allows you to quickly switch between, for example, a development environment and a production environment. In the repository we have include these as an exmaple; dev and prod directories. These both contain a file call config_sample.js that needs to be copied or renamed to config.js for it to work.

In general, to configure a new configuration enviroment called <config_name>:
 
1. Change to the configuration directory: `cd config`
2. First create a new directory under config: `mkdir <config_name>`
3. Copy config\_sample.js from dev to the directory as config.js: `cp dev/config_sample.js <config_name>/config.js`
4. Edit config.js using the description below.
 
Configuration descriptions
--------------------------

**server**: settings for the server to run with
* **http_port**: port to run the http service on
*  **https_port**: port to run the https service on

**logfile**: settings for logging
*  **filname**: output name of the log file
*  **console_level**: logging level to output to the console
*  **file_level**: logging level to output to the log file

**db**: settings to connect to the mongo database
*  **host**: host on which the mongodb runs
*  **port**: port on which to connect to the mongodb
*  **username**: username to use for mongodb authentication
*  **password**: password to use for mongodb authentication

**ssl**: **(Optional)** settings for ssl encryption, leave this out to disable it.
*  **key**: filename of ssl encryption key
*  **cert**: filename of ssl encryption certificate

**external**: settings for external resources
*  **x3domjs**: x3dom javascript URL
*  **x3domcss**: x3dom css URL
*  **repouicss**: 3drepo.io CSS location

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
