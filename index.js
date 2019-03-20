const {
	app,
	BrowserWindow
} = require('electron');
const path = require('path');

let win;

function createWindow() {
	win = new BrowserWindow({
		width: 600, //960,
		height: 400, //600,
		title: 'canvas',
		//frame: false
		titleBarStyle: 'hidden',
		//resizable: true
		//webPreferences: {
		//  nodeIntegration: false//,
		//preload: path.join(__dirname, 'preload.js')
		//}
	});
	win.setBackgroundColor('#333333');
	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', () => {
		win = null;
	});
	win.maximize();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (win === null) {
		createWindow()
	}
})