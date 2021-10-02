import React, { Fragment, useState, useEffect, useReducer } from 'react';

import IPC, { CALLBACKS } from '../apis/IPC';
import DownloadForm from '../components/DownloadForm';
import DownloadStatuses from '../components/DownloadStatuses';

export default () => {
  const downloadsReducer = (state, action) => {
    const getDownloadIndexToUpdate = (url) => {
      return state.findIndex((download) => download.url === url);
    };

    let downloadIndex;
    let newDownload;
    let newState;

    switch(action.type) {
      case 'reassign':
        return [...action.downloads]
      case 'begin':
        downloadIndex = getDownloadIndexToUpdate(action.data.url);

        if (downloadIndex !== -1) {
          newDownload = { ...state[downloadIndex], title: action.data.title };

          newState = [...state];
          newState.splice(downloadIndex, 1, newDownload);

          return newState;
        }

        return state;
      case 'progress':
        downloadIndex = getDownloadIndexToUpdate(action.data.url);

        if (downloadIndex !== -1 && state[downloadIndex].progress !== 'canceled') {
          newDownload = { ...state[downloadIndex], progress: action.data.progress };

          newState = [...state];
          newState.splice(downloadIndex, 1, newDownload);

          return newState;
        }

        return state;
      case 'end':
        downloadIndex = getDownloadIndexToUpdate(action.data.url);

        if (downloadIndex !== -1) {
          newDownload = { ...state[downloadIndex], progress: 100 };

          newState = [...state];
          newState.splice(downloadIndex, 1, newDownload);

          return newState;
        }

        return state;
      case 'canceled':
        downloadIndex = getDownloadIndexToUpdate(action.data.url);

        if (downloadIndex !== -1) {
          newDownload = { ...state[downloadIndex], progress: 'canceled' };

          newState = [...state];
          newState.splice(downloadIndex, 1, newDownload);

          return newState;
        }

        return state;
      default:
       console.error('invalid action', action);
    }
  };
  const [downloads, downloadsDispatch] = useReducer(downloadsReducer, []);

  const urlDownloadEventCallback = (payload) => {
    downloadsDispatch({ type: payload.data.type, data: payload.data.data });
  };

  useEffect(() => {
    IPC.listenFor(CALLBACKS.URL_DOWNLOAD_EVENT, urlDownloadEventCallback);

    return () => {
      IPC.stopListeningFor(CALLBACKS.URL_DOWNLOAD_EVENT, urlDownloadEventCallback);
    }
  }, []);

  const onSubmit = (values) => {
    // TODO: perform better validations with UI notification
    if (values.urls && values.urls.length && values.downloadPath) {
      downloadsDispatch(
        {
          type: 'reassign',
          downloads: values.urls.map((url) => ({ title: null, progress: null, url }))
        }
      );

      IPC.send({
        type: 'downloadUrls',
        data: {
          urls: values.urls,
          mediaType: values.mediaType,
          downloadPath: values.downloadPath
        }
      });
    } else {
      alert('Must select a download path and insert URLs first!');
    }
  };

  const onCancel = (url) => {
    IPC.send({
      type: 'cancelUrlDownload',
      data: {
        url: url
      }
    });
  };

  return (
    <Fragment>
      <h2>Download</h2>
      <DownloadForm onSubmit={onSubmit} />
      {downloads.length > 0 && <DownloadStatuses downloads={downloads} onCancel={onCancel} />}
    </Fragment>
  );
}
