const { BrowserWindow, app, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');
const fetch = require('node-fetch');

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 600,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
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
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('getWishes', async (event, type) => {
    // Look for file: "C:\Users\[user]\AppData\LocalLow\miHoYo\Genshin Impact"
    const rawInput = fs.readFileSync(
        `C:\\Users\\${process.env.USERNAME}\\AppData\\LocalLow\\miHoYo\\Genshin Impact\\output_log.txt`,
        'utf8'
    );

    // Match line
    const urlRegex = /OnGetWebViewPageFinish:https:\/\/.*?\?(.*?)#\/log/;
    match = urlRegex.exec(rawInput);

    if (match === null) return false;
    const query = match[1];

    // Gacha Types: Char Event (301), Weapon Event (302), Permanant (200), Novice (100)
    const gachaTypes = {
        character: 301,
        weapon: 302,
        permanant: 200,
        novice: 100,
    };
    let apiObj = {
        gacha_type: gachaTypes[type],
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
        win.webContents.send('wishProgress', apiObj.page);
    } while (prevList.length === 20);

    fs.writeFileSync(
        path.join(process.env.TEMP, 'genshin-wish-logs.json'),
        JSON.stringify({
            data: dataList,
            type,
        })
    );
    return dataList;
});

ipcMain.handle('export', async () => {
    const rawData = fs.readFileSync(path.join(process.env.TEMP, 'genshin-wish-logs.json'), 'utf-8');
    const data = JSON.parse(rawData);
    const defaultPath = app.getPath('desktop') + `\\genshin-${data.type}-wish-logs.csv`;
    const userPath = await dialog.showSaveDialog({
        title: 'Export Wish History',
        defaultPath,
        filters: [
            { name: 'Comma-Deliminated Values', extensions: ['csv'] },
            { name: 'All Files', extensions: ['*'] },
        ],
    });
    if (userPath.canceled) return false;

    const csvArr = data.data.map(
        (d) => `${d.item_type},${d.rank_type},${d.name},${d.time}`
    );
    const csvData = 'type,rank,name,time\n' + csvArr.join('\n');
    fs.writeFileSync(userPath.filePath, csvData);
    return true;
});
