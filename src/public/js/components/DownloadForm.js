import React, { Fragment, useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import IPC, { CALLBACKS, MESSAGES } from '../apis/IPC';
import Storage from '../lib/storage';

const {
  Check,
  Control,
  Group,
  Label,
  Text
} = Form;

const MEDIA_TYPES = {
  AUDIO_ONLY: 'audioonly',
  VIDEO_AND_AUDIO: 'videoandaudio'
};

const DownloadForm = ({ onSubmit }) => {
  const [urls, setUrls] = useState([]);
  const [mediaType, setMediaType] = useState(MEDIA_TYPES.AUDIO_ONLY);
  const [downloadPath, setDownloadPath] = useState(null);

  useEffect(() => {
    const selectDirsEventCallback = (payload) => {
      setDownloadPath(payload.data.result);
    };

    IPC.listenFor(CALLBACKS.SELECT_DIRS_EVENT, selectDirsEventCallback);

    const previousInput = Storage.get('input');
    if (previousInput) {
      const parsed = JSON.parse(previousInput);
      setDownloadPath(parsed.downloadPath || null);
      setMediaType(parsed.mediaType || MEDIA_TYPES.AUDIO_ONLY);
    }

    return () => {
      IPC.stopListeningFor(CALLBACKS.SELECT_DIRS_EVENT, selectDirsEventCallback);
    };
  }, []);

  const onUrlsChange = (syntheticEvent) => {
    const { target: { value } } = syntheticEvent;

    let sanitized = value || '';
    sanitized = value.trim();

    const currentUrls = sanitized.split(/\r?\n+/).map(s => s.trim()).filter(Boolean);
    setUrls(currentUrls);
  };

  const onSelectDownloadPathClick = () => {
    IPC.send({ type: MESSAGES.SELECT_DIRS });
  };

  const onSubmitClick = (e) => {
    e.preventDefault();

    Storage.set('input', JSON.stringify({ mediaType, downloadPath }));
    onSubmit({ urls, mediaType, downloadPath });
  }

  return (
    <Fragment>
      <Row>
        <Col>
          <Form onSubmit={onSubmitClick}>
            <Group className="mb-3" controlId="formBasicEmail">
              <div>
                <Button onClick={onSelectDownloadPathClick}>Select Download Path</Button>
              </div>
              <Text className="text-muted">
                {downloadPath || 'Choose download folder'}
              </Text>
            </Group>

            <Group>
              <Label>Media Type</Label>
              <Check
                type="radio"
                name="media-type"
                label="Audio Only"
                onChange={(e) => {
                  setMediaType(MEDIA_TYPES.AUDIO_ONLY);
                }}
                checked={mediaType === MEDIA_TYPES.AUDIO_ONLY}
              />
              <Check
                type="radio"
                name="media-type"
                label="Video and Audio"
                onChange={(e) => {
                  setMediaType(MEDIA_TYPES.VIDEO_AND_AUDIO);
                }}
                checked={mediaType === MEDIA_TYPES.VIDEO_AND_AUDIO}
              />
            </Group>

            <Group className="mb-3" controlId="formBasicEmail">
              <Label>URLs</Label>
              <Control rows="7" as="textarea" onChange={onUrlsChange} />
              <Text className="text-muted">
                Enter as many URLs as you like, each on a new line
              </Text>
            </Group>

            <Button variant="primary" type="submit">
              Download
            </Button>
          </Form>
        </Col>
      </Row>
    </Fragment>
  );
};

export default DownloadForm;
