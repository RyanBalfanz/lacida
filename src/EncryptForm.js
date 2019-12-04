import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Form, FormGroup, Label, Input, Col } from 'reactstrap';

import * as openpgp from 'openpgp';

import { handleFile } from './utilities';
  
class EncryptForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ciphertext: '',
			message: '',
			passphrase: this.props.defaultPassphrase,
			plaintext: '',
			privateKey: this.props.defaultPrivateKey,
			publicKey: this.props.defaultPublicKey,
		};
		
		this.handleFileUploadChange = this.handleFileUploadChange.bind(this);

		this.handleMessageChange = this.handleMessageChange.bind(this);
		this.handlePassphraseChange = this.handlePassphraseChange.bind(this);
		this.handlePrivateKeyChange = this.handlePrivateKeyChange.bind(this);
		this.handlePublicKeyChange = this.handlePublicKeyChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.defaultPassphrase !== this.state.passphrase) {
			this.setState({ passphrase: nextProps.defaultPassphrase });
		}
		if (nextProps.defaultPrivateKey !== this.state.privateKey) {
			this.setState({ privateKey: nextProps.defaultPrivateKey });
		}
		if (nextProps.defaultPublicKey !== this.state.publicKey) {
			this.setState({ publicKey: nextProps.defaultPublicKey });
		}
	}

	handleMessageChange(event) {
		const plaintext = event.target.value;
		this.setState({
			plaintext: plaintext,
			message: plaintext,
		});
	}

	handlePassphraseChange(event) {
		this.setState({passphrase: event.target.value});
	}

	handlePrivateKeyChange(event) {
		this.setState({privateKey: event.target.value});
	}

	handlePublicKeyChange(event) {
		this.setState({publicKey: event.target.value});
	}

	handleFileUploadChange(event) {
		const files = event.target.files;
		if (files.length !== 1) {throw Error("Please select a single file.")}
		handleFile(files[0])
			.then(result => this.setState({
				plaintext: result,
				message: result,
			}))
			.catch(error => console.error(error));
	}
	
	handleSubmit(event) {
		// let privKeyObj = null;
		// if (this.state.privateKey !== '') {
		// 	const privKeyObj = openpgp.key.readArmored(this.state.privateKey).keys[0]
		// 	if (this.state.passphrase !== '') {
		// 		privKeyObj.decrypt(this.state.passphrase).catch(((error) => console.error(error)))
		// 	}
		// }
		
		const options = {
			data: this.state.plaintext,
			publicKeys: openpgp.key.readArmored(this.state.publicKey).keys,
			// privateKeys: [privKeyObj]
		}
		
		openpgp.encrypt(options).then(ciphertext => {
			const ciphertextData = ciphertext.data;
			this.setState({ciphertext: ciphertextData, message: ciphertextData});
			this.props.onMessageEncrypted(ciphertextData);
			return ciphertextData;
		})
		
		event.preventDefault();
	}
	
	render() {
		return (
			<Form onSubmit={this.handleSubmit}>
				<FormGroup row>
					<Label for="publicKey" sm={2}>Public Key</Label>
					<Col sm={10}>
						<Input
							required
							type="textarea"
							name="publicKey"
							rows="5"
							value={this.state.publicKey}
							onChange={this.handlePublicKeyChange}
						/>
					</Col>
				</FormGroup>
				<FormGroup row hidden>
					<Label for="privateKey" sm={2}>Private Key</Label>
					<Col sm={10}>
						<Input
							type="textarea"
							name="privateKey"
							rows="5"
							value={this.state.privateKey}
							onChange={this.handlePrivateKeyChange}
						/>
					</Col>
				</FormGroup>
				<FormGroup row hidden>
					<Label for="passphrase" sm={2}>Passphrase</Label>
					<Col sm={10}>
						<Input
							type="password"
							name="passphrase"
							value={this.state.passphrase}
							onChange={this.handlePassphraseChange}
						/>
					</Col>
				</FormGroup>
				<FormGroup row>
					<Label for="fileUpload" sm={2}>File upload</Label>
					<Col sm={10}>
						<Input
							type="file"
							name="fileUpload"
							onChange={this.handleFileUploadChange}
						/>
					</Col>
				</FormGroup>
				<FormGroup row>
					<Label for="message" sm={2}>Message</Label>
					<Col sm={10}>
						<Input
							type="textarea"
							name="message"
							placeholder="The message in plaintext."
							value={this.state.message}
							onChange={this.handleMessageChange}
						/>
					</Col>
				</FormGroup>
				<Button type="submit" color="primary">Encrypt</Button>
			</Form>
		);
	}
}

EncryptForm.propTypes = {
	defaultPassphrase: PropTypes.string.isRequired,
	defaultPrivateKey: PropTypes.string,
	defaultPublicKey: PropTypes.string.isRequired,
	onMessageEncrypted: PropTypes.func.isRequired,
};

EncryptForm.defaultProps = {};

export default EncryptForm;
