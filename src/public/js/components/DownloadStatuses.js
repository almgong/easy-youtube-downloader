import React, { Fragment } from 'react';
import { Badge, Col, CloseButton, Row, Spinner, Table } from 'react-bootstrap';

export default ({ downloads, onCancel }) => {
  const renderProgressText = (progress) => {
    if (progress === 'canceled') {
      return (
        <Badge pill bg="danger">
          Canceled
        </Badge>
      );
    } else if (typeof progress === 'number') {
      if (progress !== 100) {
        return (
          <Fragment>
            <span>{progress}%</span>&nbsp;
            <Spinner animation="border" variant="success" size="sm" />
          </Fragment>
        );
      } else {
        return (
          <Badge pill bg="success">
            Done
          </Badge>
        );
      }
    } else {
      return <Spinner animation="border" variant="success" size="sm" />;
    }
  };

  return (
    <Table>
      <thead>
        <tr>
          <th>URL</th>
        </tr>
      </thead>
      <tbody>
        {downloads.map((download, index) => (
          <tr key={`${download.url}-${index}`}>
            <td>
              <Row>
                <Col sm="9">
                  <CloseButton title="Cancel" onClick={() => onCancel(download.url)} className="d-inline-block" />&nbsp;
                  <span className="text-break">{download.title || download.url}</span>
                </Col>
                <Col sm="3" className="d-flex align-items-center">
                  {renderProgressText(download.progress)}
                  {download.error &&
                    <Badge pill bg="danger">
                      Error
                    </Badge>
                  }
                </Col>
              </Row>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
