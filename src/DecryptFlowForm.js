import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Form, FormGroup, FormText, Label, Input, Col } from 'reactstrap';
import Dropzone from 'react-dropzone';

import * as openpgp from 'openpgp';

// import { handleFile } from './utilities';

class DecryptFlowForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ciphertext: this.props.defaultCiphertext,
			message: '',
			passphrase: this.props.defaultPassphrase,
			plaintext: this.props.defaultPlaintext,
			privateKey: this.props.defaultPrivateKey,
			publicKey: this.props.defaultPublicKey,
			disabled: false,
			encryptedFileFiles: [],
			privateKeyFiles: [],
			privateKeyDropzoneDisabled: false,
			encryptedFileDropzoneDisabled: true,
			decryptSubmitButtonDisabled: true,
		};

		this.onDropEncryptedFile = this.onDropEncryptedFile.bind(this);
		this.onDropPrivateKey = this.onDropPrivateKey.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	onDropPrivateKey(files) {
		debugger;
		// console.log(files);
		this.setState({privateKeyFiles: files});
		this.setState({privateKey: files[0]});
		this.setState({encryptedFileDropzoneDisabled: false});
		this.props.onPrivateKeyFileChange(files[0]);
	}

	onDropEncryptedFile(files) {
		// console.log(files);
		this.setState({encryptedFileFiles: files});
		this.setState({privateKey: files[0]});
		this.setState({decryptSubmitButtonDisabled: false});
	}

	handleSubmit(event) {
		debugger;
		const {
			message,
			passphrase,
			privateKey,
			publicKey,
		} = this.state;

		const privKeyObj = openpgp.key.readArmored(privateKey).keys[0]
		// let errors = [];
		if (passphrase !== '') {
			privKeyObj.decrypt(passphrase)
				.then(result => console.log(result))
				.catch((error => {
					alert(error.message);
					console.error(error);
					return;
				}))
		}

		const options = {
			message: openpgp.message.readArmored(message),
			// publicKeys: openpgp.key.readArmored(publicKey).keys,
			privateKeys: [privKeyObj]
		}
		
		openpgp.decrypt(options)
			.then(plaintext => {
				const plaintextData = plaintext.data;
				this.setState({plaintext: plaintextData, message: plaintextData})
				this.props.onMessageDecrypted(plaintextData);
			})
			.catch(error => {
				alert(error.message);
				console.error(error);
			});
		
		event.preventDefault();
	}
	
	render() {
		return (
			<Form onSubmit={this.handleSubmit}>
				<FormGroup row>
					<Label for="privateKeyFile">Step 1: Select a decrpytion key file.</Label>
						<Input
							type="file"
							id="privateKeyFile"
							name="privateKeyFile"
							accept=".asc, .gpg"
							label="Yo, pick a fileasdfsadfsd!"
							onChange={this.handlePrivateKeyFileChange}
						/>
						<FormText color="muted">This is the secret private used to decrypt files.</FormText>
					<Button type="submit" size="lg" block color="primary" disabled={this.state.encryptedFileFiles.length === 0}>Decrypt and Download</Button>
				</FormGroup>
			</Form>
		);
	}
}

DecryptFlowForm.propTypes = {
	// defaultCiphertext: PropTypes.string.isRequired,
	// defaultPassphrase: PropTypes.string.isRequired,
	// defaultPlaintext: PropTypes.string.isRequired,
	// defaultPrivateKey: PropTypes.string.isRequired,
	// defaultPublicKey: PropTypes.string,
	// onMessageDecrypted: PropTypes.func.isRequired,
	onPrivateKeyFileChange: PropTypes.func.isRequired,
};

DecryptFlowForm.defaultProps = {
	// defaultPlaintext: '',
	// defaultPrivateKey: '',
	// onPrivateKeyFileChange: ((file) => { console.count(`onPrivateKeyFileChange`); }),
};

export default DecryptFlowForm;
