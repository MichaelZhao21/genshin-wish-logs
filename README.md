# Genshin Wish Extractor!

Extract wish history (gacha) from Genshin Impact's Windows Client using this simple electron app! You can export the data as a csv file to use in data analysis :)

## How it works

1. When opening the wish logs in the game, the game will create a log file, stored at `C:\Users\[user]\AppData\LocalLow\miHoYo\Genshin Impact\output_log.txt`. The script will look for this file and read its contents.
2. Upon opening the wish history menu, the game will perform a GET request to get the actual page for wish history. The page displayed on the wish history menu is actually an HTML page! In the GET request, the game passes an `authkey` querystring. The script will use this authkey to request the wish history.
3. On the web page, the page actually makes more requests to their "secret" backend server. The `https://hk4e-api-os.mihoyo.com/event/gacha_info/api/getGachaLog` endpoint will return a list of wishes. The request requires you to include a couple of fields: `{gacha_type, page, size, end_id, authkey}`.
4. Using this, we can iterate through all of the wishes and retrieve the wish history.
5. The program will finally write this data to a csv (comma-seperated values) file!

## Installation and Execution

1. Go to [releases](https://github.com/MichaelZhao21/genshin-wish-logs/releases) and the latest release should be at the top.
2. Download the `genshin-wish-logs-win32-x64.zip` file.
3. Unzip the file and run `genshin-wish-logs.exe`.

## Development Instructions

1. Simply clone the repo and run `yarn install` to install
2. Run `yarn start` to develop the app using electron forge
