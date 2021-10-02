// Interface for downloading YT video and audio

const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');

const inProgressDownloads = {};

module.exports = {
  abort: (url) => {
    if (inProgressDownloads[url]) {
      inProgressDownloads[url].destroy();
      delete inProgressDownloads[url];
    }
  },
  download: async function(url, options) {
    const downloadOptions = {
      downloadPath: null,
      downloadType: 'audioonly', // audioonly || videoandaudio
      onBegin: () => {},
      onProgress: () => {},
      onEnd: (error) => { console.log('error happened in download', error) },
      onError: () => {},
      ...options
    };

    if (!ytdl.validateURL(url)) {
      downloadOptions.onError('invalid YT url');
      return;
    }

    const basicInfo = await ytdl.getInfo(url);

    if (!basicInfo.videoDetails) {
      downloadOptions.onError('no video details');
      return;
    }

    const title = basicInfo.videoDetails.title;
    const audioOnlyFormats = ytdl.filterFormats(basicInfo.formats, downloadOptions.downloadType);
    const format = ytdl.chooseFormat(
      audioOnlyFormats,
      {
        quality: downloadOptions.downloadType === 'audioonly' ? 'highestaudio' : 'highest',
        filter: downloadOptions.downloadType
      }
    );

    downloadOptions.onBegin({ url, title });

    let batchCounter = 0;
    const audio = ytdl(url, { quality: 'highestaudio', filter: downloadOptions.downloadType })
      .on('progress', (_, downloaded, total) => {
        if (++batchCounter == 3 && inProgressDownloads[url]) { // every 3 chunks, emit progress
          downloadOptions.onProgress({ url, progress: Number((downloaded / total * 100).toFixed(2)) });
          batchCounter = 0;
        }
      })
      .on('end', () => {
        downloadOptions.onEnd({ url });
        delete inProgressDownloads[url];
      })
      .on('error', (error) => {
        downloadOptions.onError(error);
        delete inProgressDownloads[url];
      });

    inProgressDownloads[url] = audio
      .pipe(
        fs.createWriteStream(
          path.resolve(downloadOptions.downloadPath, title + '.' + format.container)
        )
      );
  }
};
