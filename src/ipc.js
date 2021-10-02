const { dialog, ipcMain } = require('electron');

const youtube = require('./youtube');

module.exports = {
  init: () => {
    ipcMain.on('toMainProcess', async (event, payload) => {
      if (payload.type === 'select-dirs') {
        const result = await dialog.showOpenDialog(win, {
          properties: ['openDirectory']
        });

        event.reply('fromMainProcess', { type: 'select-dirs-evt', data: { result: result.filePaths[0] || '' } });
      } else if (payload.type === 'downloadUrls') {
        const urls = payload.data.urls;
        urls.forEach((url) => {
          youtube.download(
            url,
            {
              downloadPath: payload.data.downloadPath,
              downloadType: payload.data.mediaType,
              onBegin: (data) => event.reply('fromMainProcess', { type: 'url-download-evt', data: { type: 'begin', data } }),
              onProgress: (data) => { event.reply('fromMainProcess', { type: 'url-download-evt', data: { type: 'progress', data } })},
              onEnd: (data) => event.reply('fromMainProcess', { type: 'url-download-evt', data: { type: 'end', data } }),
              // TODO: onError:
            }
          );
        })
      } else if (payload.type === 'cancelUrlDownload') {
        const url = payload.data.url;

        youtube.abort(payload.data.url);
        event.reply('fromMainProcess', { type: 'url-download-evt', data: { type: 'canceled', data: { url } } });
      }
    });
  }
}
