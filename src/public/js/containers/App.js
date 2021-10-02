import React, { Fragment, Component } from 'react';
import { Container } from 'react-bootstrap';

import DownloadPage from './DownloadPage';

export default class App extends Component {
  render() {
    return(
      <Fragment>
        <Container>
          <DownloadPage />
        </Container>
      </Fragment>
    );
  }
}
