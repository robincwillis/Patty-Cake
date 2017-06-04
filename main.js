const electron = require('electron')
const { app, BrowserWindow, Menu } = require('electron');

const path = require('path')
const url = require('url')
let mainWindow

function createWindow () {
	mainWindow = new BrowserWindow({width: 800, height: 600})
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname,'build' ,'index.html'),
		protocol: 'file:',
		slashes: true
	}))

	mainWindow.webContents.openDevTools()

	mainWindow.on('closed', function () {
		mainWindow = null
	})
}

app.on('ready', () => {
	createMenu();
	createWindow();
})

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow()
	}
})

function createMenu () {
	const template = [
		{
			label: 'Filter',
			submenu: [
				{
					label: 'Hello',
					accelerator: 'Shift+CmdOrCtrl+H',
					click() {
						console.log('Oh, hi there!')
					}
				},

			]
		}
	];

	//

	let menu = Menu.getApplicationMenu();

	console.log(menu);

	//Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}


