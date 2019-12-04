import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Dropzone from 'react-dropzone';
import { Button, Card, CardText, CardTitle } from 'reactstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faFile from '@fortawesome/fontawesome-free-solid/faFile';

class FileSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: '',
    };

    this.handleOnDrop = this.handleOnDrop.bind(this);
  }

  handleOnDrop(files) {
    this.setState({files});
    this.props.onFileSelect(files);
  }

  render() {
    const {
      buttonStateColors,
      constraints,
      disabled,
      fileIcon,
      iconSize,
    } = this.props;
    const cardColor = "secondary";
    const constraintsSeparator = ", ";
    const emptyStyle = {};
    const openModalButtonText = "Select file";

    return (
      <Dropzone style={emptyStyle} disabled={disabled} onDrop={this.handleOnDrop}>
        <Card body outline color={cardColor}>
          <CardTitle><FontAwesomeIcon icon={fileIcon} size={iconSize}/></CardTitle>
          <CardText>{constraints.map(v => v.toUpperCase()).join(constraintsSeparator)}</CardText>
          <Button
            color={disabled ? buttonStateColors.disabled : buttonStateColors.enabled}
            disabled={disabled}
          >{openModalButtonText}</Button>
        </Card>
      </Dropzone>
    );
  }
}

FileSelector.propTypes = {
  buttonStateColors: PropTypes.object.isRequired,
  constraints: PropTypes.array.isRequired,
  disabled: PropTypes.bool.isRequired,
  fileIcon: PropTypes.object.isRequired,
  iconSize: PropTypes.string.isRequired,
  onFileSelect: PropTypes.func.isRequired,
}

FileSelector.defaultProps = {
  buttonStateColors: {
    enabled: "primary",
    disabled: "secondary",
  },
  disabled: false,
  fileIcon: faFile,
}

export default FileSelector;
