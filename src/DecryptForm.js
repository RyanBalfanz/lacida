import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Form, FormGroup, Label, Input, Col } from 'reactstrap';

import * as openpgp from 'openpgp';

import { handleFile } from './utilities';

class DecryptForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			ciphertext: this.props.defaultCiphertext,
			message: '',
			passphrase: this.props.defaultPassphrase,
			plaintext: this.props.defaultPlaintext,
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
		if (nextProps.defaultCiphertext !== this.state.ciphertext) {
			const ciphertext = nextProps.defaultCiphertext;
			this.setState({ciphertext: ciphertext, message: ciphertext});
		}
		if (nextProps.defaultPassphrase !== this.state.passphrase) {
			this.setState({passphrase: nextProps.defaultPassphrase});
		}
		if (nextProps.defaultPlaintext !== this.state.plaintext) {
			this.setState({plaintext: nextProps.defaultPlaintext});
		}
		if (nextProps.defaultPrivateKey !== this.state.privateKey) {
			this.setState({privateKey: nextProps.defaultPrivateKey});
		}
		if (nextProps.defaultPublicKey !== this.state.publicKey) {
			this.setState({publicKey: nextProps.defaultPublicKey});
		}
	}

	handleMessageChange(event) {
		this.setState({
			ciphertext: event.target.value,
			message: event.target.value,
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
		const {
			message,
			passphrase,
			privateKey,
			// publicKey,
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
				<FormGroup row hidden>
					<Label for="publicKey" sm={2}>Public Key</Label>
					<Col sm={10}>
						<Input
							type="textarea"
							name="publicKey"
							rows="5"
							value={this.state.publicKey}
							onChange={this.handlePublicKeyChange}
						/>
					</Col>
				</FormGroup>
				<FormGroup row>
					<Label for="privateKey" sm={2}>Private Key</Label>
					<Col sm={10}>
						<Input
							required
							type="textarea"
							name="privateKey"
							rows="5"
							value={this.state.privateKey}
							onChange={this.handlePrivateKeyChange}
						/>
					</Col>
				</FormGroup>
				<FormGroup row>
					<Label for="passphrase" sm={2}>Password</Label>
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
							placeholder="The encrypted message."
							value={this.state.message}
							onChange={this.handleMessageChange}
						/>
					</Col>
				</FormGroup>
				<Button type="submit" color="primary">Decrypt</Button>
			</Form>
		);
	}
}

DecryptForm.propTypes = {
	defaultCiphertext: PropTypes.string.isRequired,
	defaultPassphrase: PropTypes.string.isRequired,
	defaultPlaintext: PropTypes.string.isRequired,
	defaultPrivateKey: PropTypes.string.isRequired,
	defaultPublicKey: PropTypes.string,
	onMessageDecrypted: PropTypes.func.isRequired,
};

DecryptForm.defaultProps = {
	defaultPlaintext: '',
};

export default DecryptForm;
