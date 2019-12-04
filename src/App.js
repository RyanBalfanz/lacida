import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Button, Container, Form, FormGroup, FormText, Label, Input, Row, Col,
} from 'reactstrap';
import faFile from '@fortawesome/fontawesome-free-solid/faFile';
import faKey from '@fortawesome/fontawesome-free-solid/faKey';

import logo from './logo.svg';
import './App.css';
// import EncryptForm from './EncryptForm'
// import DecryptForm from './DecryptForm'
// import DecryptFlowForm from './DecryptFlowForm'
// import GenerateKeyForm from './GenerateKeyForm'
import FileUtils from './FileUtils';
import FileSelector from './FileSelector';
import OpenPGP from './OpenPGP';

function handleFile(file) {      
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = handleOnload;
    reader.onerror = handleOnerror;
    reader.readAsText(file);

    function handleOnload() {
      resolve(reader.result);
    }

    function handleOnerror() {
      reader.abort();
      reject(new DOMException("Problem parsing input file."));
    }
  });
}

class App extends Component {
  static propTypes = {
    privateKeyFileConstraints: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    privateKeyFileConstraints: [".asc", ".gpg"],
  };

  constructor(props) {
    super(props);
    this.state = {
      // ciphertext: '',
      passphrase: 'lacida',
      // plaintext: '',
      // privateKey: '',
      // publicKey: '',
      encryptedFile: '',
      privateKeyFile: '',
      stepOneDisabled: false,
      stepTwoDisabled: true,
    };

    this.handleOnEncryptedFileSelect = this.handleOnEncryptedFileSelect.bind(this);
    this.handleOnPrivateKeyFileSelect = this.handleOnPrivateKeyFileSelect.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    // this.fetchKeys();
  }

  // fetchKeys() {
  //   const privateKeyUrl = "insecure-private-key.asc";
  //   const publicKeyUrl = "insecure-public-key.asc";

  //   fetch(privateKeyUrl)
  //     .then(response => responseText(response))
  //     .then(key => this.setState({privateKey: key}))
  //     .catch(error => console.error(error));

  //   fetch(publicKeyUrl)
  //     .then(response => responseText(response))
  //     .then(key => this.setState({publicKey: key}))
  //     .catch(error => console.error(error));

  //   function responseText(response) {
  //     if (!response.ok) {
  //       console.error(response);
  //       throw Error(response.statusText);
  //     }
  //     return response.text().then(text => text.trim());
  //   }
  // }

  // handleDecryptedMessage(plaintext) {
  //   this.setState({plaintext: plaintext});
  // }

  // handleEncryptedMessage(ciphertext) {
  //   this.setState({ciphertext: ciphertext});
  // }

  // handlePassphraseChange(passphrase) {
  //   this.setState({passphrase: passphrase, ciphertext: '', plaintext: ''});
  // }

  // handlePrivateKeyChange(privateKey) {
  //   this.setState({privateKey: privateKey, ciphertext: '', plaintext: ''});
  // }

  // handlePublicKeyChange(publicKey) {
  //   this.setState({publicKey: publicKey, ciphertext: '', plaintext: ''});
  // }

  handlePrivateKeyFileChange(event) {
    const files = event.target.files;
    if (files.length !== 1) {throw Error("Please select a single file.")}
    handleFile(files[0])
      .then(result => this.setState({privateKey: result, ciphertext: '', plaintext: ''}))
      .catch(error => console.error(error));
  }

  handleEncryptedFileChange(event) {
    const files = event.target.files;
    if (files.length !== 1) {throw Error("Please select a single file.")}
    handleFile(files[0])
      .then(result => this.setState({ciphertext: result, plaintext: ''}))
      .catch(error => console.error(error));
  }

  // handlePublicKeyFileChange(event) {
  //   const files = event.target.files;
  //   if (files.length !== 1) {throw Error("Please select a single file.")}
  //   handleFile(files[0])
  //     .then(result => this.setState({publicKey: result, ciphertext: '', plaintext: ''}))
  //     .catch(error => console.error(error));
  // }

  // handleOnPrivateKeyFileChange(f) {
  //   this.handlePrivateKeyFileChange({ target: { files:[f] } });
  // }

  handleOnPrivateKeyFileSelect(files) {
    const privateKeyFile = files[0];
    this.setState({
      privateKeyFile,
      stepTwoDisabled: false,
    });
    this.handlePrivateKeyFileChange({target: {files: [privateKeyFile]}});
  }

  handleOnEncryptedFileSelect(files) {
    const encryptedFile = files[0];
    this.setState({encryptedFile: encryptedFile});
    this.setState({formIsValid: true});
    this.handleEncryptedFileChange({target: {files: [encryptedFile]}});
  }

  handleSubmit(event) {
    event.preventDefault();

    const {
      ciphertext,
      encryptedFile,
      passphrase,
      privateKey,
    } = this.state;

    const filename = withoutExtension(encryptedFile.name);
    OpenPGP.decrypt(ciphertext, privateKey, passphrase)
      .then(data => this.handleDownloadComplete(data, filename))
      .catch(error => alert(error));

    function withoutExtension(name, separator) {
      if (separator === undefined) { separator = "."; }
      const splits = name.split(separator);
      return splits.splice(0, splits.length - 1).join(separator);
    }
  }

  handleDownloadComplete(data, filename) {
    FileUtils.saveAs(data, filename);
  }

  buttonColor() {
    const key = this.state.formIsValid;
    return {true: "primary", false: "secondary"}[key];
  }

  render() {
      const iconSizeLarge = "6x";
      const privateKeyFileConstraints = this.props.privateKeyFileConstraints.slice().sort();
      const prependExt = elements => [".txt", elements].join('');
      const encryptedFileConstraints = [].concat(privateKeyFileConstraints.map(prependExt), "etc.");

      return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Lacida</h1>
        </header>
        <p className="App-intro">
          To get started, select a decryption key (e.g. <code>{privateKeyFileConstraints.join(", ")}</code>) and an encrypted file.
        </p>
        <Container>
          <Row>
            <Col xs={6}>
              <FileSelector
                constraints={privateKeyFileConstraints}
                fileIcon={faKey}
                iconSize={iconSizeLarge}
                onFileSelect={this.handleOnPrivateKeyFileSelect}
              />
            </Col>
            <Col xs={6}>
              <FileSelector
                constraints={encryptedFileConstraints}
                disabled={!this.state.privateKey}
                fileIcon={faFile}
                iconSize={iconSizeLarge}
                onFileSelect={this.handleOnEncryptedFileSelect}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Form onSubmit={this.handleSubmit}>
                <FormGroup disabled={true} hidden={true} >
                  <Label for="privateKeyFile">Private Key</Label>
                  <Input type="file" name="privateKeyFile"/>
                </FormGroup>
                <FormGroup disabled={true} hidden={true}>
                  <Label for="encryptedFile">Encrypted File</Label>
                  <Input type="file" name="encryptedFile"/>
                </FormGroup>
                <FormGroup>
                  <Label for="">&nbsp;</Label>
                  <Button
                    type="submit"
                    color={this.buttonColor()}
                    disabled={!this.state.formIsValid}
                    block
                  >Decrypt!</Button>
                </FormGroup>
              </Form>
            </Col>
          </Row>
        </Container>
        {/* <DecryptFlowForm
            privateKeyFile={this.state.privateKey}
            defaultPrivateKeyFile={this.state.privateKey}
            encryptedFile={this.state.ciphertext}
            onEncryptedFileChange={console.log}
            onEncryptedFileDecrypted={console.log}
            onPrivateKeyFileChange={this.handleOnPrivateKeyFileChange}
          /> */}
          {/* <Form>
            <fieldset>
              <legend>Use an existing key pair</legend>
              <FormGroup row>
                <Label for="privateKeyFile" sm={2}>Private Key File</Label>
                <Col sm={10}>
                  <Input type="file" name="privateKeyFile" accept=".asc, .gpg" onChange={this.handlePrivateKeyFileChange} />
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label for="publicKeyFile" sm={2}>Public Key File</Label>
                <Col sm={10}>
                  <Input type="file" name="publicKeyFile" accept=".asc, .gpg" onChange={this.handlePublicKeyFileChange} />
                </Col>
              </FormGroup>
            </fieldset>
          </Form> */}
          {/* <h2>Generate a new key pair</h2>
          <GenerateKeyForm
            onPassphraseChange={this.handlePassphraseChange}
            onPrivateKeyChange={this.handlePrivateKeyChange}
            onPublicKeyChange={this.handlePublicKeyChange}
          />
          <h2>Encrypt a message</h2>
          <EncryptForm
            defaultPassphrase={this.state.passphrase}
            // defaultPrivateKey={this.state.privateKey}
            defaultPublicKey={this.state.publicKey}
            onMessageEncrypted={this.handleEncryptedMessage}
          />
          <h2>Decrypt a message</h2>
          <DecryptForm
            defaultCiphertext={this.state.ciphertext}
            defaultPassphrase={this.state.passphrase}
            defaultPrivateKey={this.state.privateKey}
            // defaultPublicKey={this.state.publicKey}
            onMessageDecrypted={this.handleDecryptedMessage}
          /> */}
      </div>
    );
  }
}

export default App;
