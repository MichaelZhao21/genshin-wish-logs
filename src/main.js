const { BrowserWindow, app, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');
const fetch = require('node-fetch');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });

    win.loadFile('src/index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    console.log('Closed!');
    if (process.platform === 'darwin') app.quit();
});

ipcMain.handle('getWishes', async () => {
    const userRegex = /Users\\(.*?)\\/;
    let match = userRegex.exec(__dirname);
    const user = match[1];

    if (user === null || user === undefined) return false;

    // Look for file: "C:\Users\[user]\AppData\LocalLow\miHoYo\Genshin Impact"
    const rawInput = fs.readFileSync(
        `C:\\Users\\${user}\\AppData\\LocalLow\\miHoYo\\Genshin Impact\\output_log.txt`,
        'utf8'
    );

    // Match line
    const urlRegex = /OnGetWebViewPageFinish:https:\/\/.*?\?(.*?)#\/log/;
    match = urlRegex.exec(rawInput);
    const query = match[1];

    let apiObj = {
        gacha_type: 301,
        page: 0,
        size: 20,
        end_id: 0,
    };
    const apiUrl = `https://hk4e-api-os.mihoyo.com/event/gacha_info/api/getGachaLog?${query}`;

    // Get wishes through api
    let prevList = [{ id: 0 }];
    let dataList = [];
    do {
        apiObj.page++;
        apiObj.end_id = prevList[prevList.length - 1].id;

        let data = await fetch(`${apiUrl}&${querystring.encode(apiObj)}`).then((data) =>
            data.json()
        );
        prevList = data.data.list;
        dataList = dataList.concat(data.data.list);
        console.log(`Page ${apiObj.page}`);
    } while (prevList.length === 20);

    console.log(dataList.map((d) => d.name));
    return dataList;
});
