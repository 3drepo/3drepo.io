3drepo.io ![](https://travis-ci.org/3drepo/3drepo.io.svg?branch=master)
=========

3drepo.io is a web based front-end for viewing version controlled 3D data stored in a MongoDB. Getting data into the database is controlled by the [3D Repo Bouncer](https://github.com/3drepo/3drepobouncer) library and [3D Repo GUI](https://github.com/3drepo/3drepogui) separate projects.

![3drepoio_1a](https://cloud.githubusercontent.com/assets/3008807/12302435/09590660-ba1d-11e5-8bab-c95de3f788c5.jpg)

### Latest Releases
* 19 Apr 2016 [3drepo.io 1.0b](https://github.com/3drepo/3drepo.io/releases/tag/v1.0.0b)
* 15 Feb 2016 [3drepo.io 1.0rc2](https://github.com/3drepo/3drepo.io/releases/tag/v1.0.0-rc2)
* 15 Feb 2016 [3drepo.io 1.0rc1](https://github.com/3drepo/3drepo.io/releases/tag/v1.0.0-rc1)
* 08 Jan 2016 [3drepo.io 1.0a](https://github.com/3drepo/3drepo.io/releases/tag/1.0a)

## Licenses
This project is Copyright of [3D Repo Ltd](http://3drepo.org), a company registered in England and Wales No. 09014101, and is released under the open source [GNU Affero General Public License v3](http://www.gnu.org/licenses/agpl-3.0.en.html). Should you require a commercial license, please contact [support@3drepo.org](mailto:support@3drepo.org). All contributors are required to sign either the [3D Repo Individual](https://gist.github.com/jozefdobos/e177af804c9bcd217b73) or the [3D Repo Entity](https://gist.github.com/jozefdobos/c7c4c1c18cfb211c45d2) [Contributor License Agreement (CLA)](https://en.wikipedia.org/wiki/Contributor_License_Agreement).

### Contributing
We very much encourage contributions to the 3D Repo project. Firstly, fork the desired repository and commit your modifications there. Once happy with the changes, you can generate a [pull request](https://help.github.com/articles/using-pull-requests/) and our team will integrate it upstream after a review.

Your pull requests should:

1. Follow the style of the existing code
2. One commit should just do one thing, and one thing only
3. Work in a branch assigned to a specific issue number, e.g. branch called "ISSUE_138"
4. Each commit message should be prefixed with the issue number, e.g. "#138 Fixing bug xyz..."
5. Rebase your branch against [upstream's master](https://help.github.com/articles/merging-an-upstream-repository-into-your-fork/) so that we don't pull redundant commits
6. Sign our [3D Repo Individual CLA](https://gist.github.com/jozefdobos/e177af804c9bcd217b73) or if you are representing a legal entity, sign the [3D Repo Entity CLA](https://gist.github.com/jozefdobos/c7c4c1c18cfb211c45d2)

Installation
------------

Note: If using windows, please ensure cmd.exe was invoked as administrator (i.e. Right click -> Run as Administrator).

1. Clone the repository: `git clone https://github.com/3drepo/3drepo.io.git`
2. Change directory: `cd 3drepo.io`
3. Check out latest release: `git checkout tags/v1.0.0b`
4. Update submodules: `git submodule update --init`
5. Configure the system as below.
6. Ensure [Python v2](https://www.python.org/) and [Node.js](https://nodejs.org/) are installed.
7. Install the required dependencies: `npm install`  
8. Install the client dependencies: `bower install`  
9. Compile the frontend: `grunt frontend`

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

If you need any help or want to contribute please contact: [support@3drepo.org](mailto:support@3drepo.org)
We look forward to hearing from you.
