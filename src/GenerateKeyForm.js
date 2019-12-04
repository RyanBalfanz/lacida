import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Form, FormGroup, Label, Input, Col } from 'reactstrap';

import * as openpgp from 'openpgp';

class GenerateKeyForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			name: '',
			passphrase: '',
			privateKey: '',
			publicKey: '',
		};
		
		this.handleEmailChange = this.handleEmailChange.bind(this);
		this.handlePassphraseChange = this.handlePassphraseChange.bind(this);
		this.handlePublicKeyChange = this.handlePublicKeyChange.bind(this);
		this.handlePrivateKeyChange = this.handlePrivateKeyChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}
	
	handleEmailChange(event) {
		this.setState({email: event.target.value});
	}

	handlePassphraseChange(event) {
		this.setState({passphrase: event.target.value});
		this.props.onPassphraseChange(event.target.value);
	}

	handlePrivateKeyChange(event) {
		this.props.onPrivateKeyChange(event.target.value);
	}

	handlePublicKeyChange(event) {
		this.props.onPublicKeyChange(event.target.value);
	}

	handleSubmit(event) {
		const {keyExpirationTime, numBits} = this.props;
		const {email, name, passphrase} = this.state;

		var options = {
			userIds: [{name: name, email: email}],
			passphrase: passphrase,
			numBits: numBits,
			keyExpirationTime: keyExpirationTime,
		};

		openpgp.generateKey(options).then((key) => {
			this.setState({
				privateKey: key.privateKeyArmored,
				publicKey: key.publicKeyArmored,
			});
			this.props.onPrivateKeyChange(key.privateKeyArmored);
			this.props.onPublicKeyChange(key.publicKeyArmored);
		});
		
		event.preventDefault();
	}
	
	render() {
		const emailInputPlaceholder = "you@example.com";

		return (
			<Form onSubmit={this.handleSubmit}>
				<FormGroup row>
					<Label for="email" sm={2}>Email Address</Label>
					<Col sm={10}>
						<Input
							type="email"
							name="email"
							placeholder={emailInputPlaceholder}
							value={this.state.email}
							onChange={this.handleEmailChange}
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
				<FormGroup row hidden>
					<Label for="numBits" sm={2}>Number of bits</Label>
					<Col sm={10}>
						<Input
							required
							readOnly
							disabled
							type="select"
							name="numBits"
							defaultValue={this.props.numBits}
						>
							{numBitsOptions.map(x => <option key={x.toString()} value={x}>{x.toString()}</option>)}
						</Input>
					</Col>
				</FormGroup>
				<FormGroup row hidden={this.state.publicKey === ''}>
					<Label for="publicKey" sm={2}>Public Key</Label>
					<Col sm={10}>
						<Input
							readOnly
							disabled
							type="textarea"
							name="publicKey"
							rows="5"
							value={this.state.publicKey}
							onChange={this.handlePublicKeyChange}
						/>
					</Col>
				</FormGroup>
				<FormGroup row hidden={this.state.privateKey === ''}>
					<Label for="privateKey" sm={2}>Private Key</Label>
					<Col sm={10}>
						<Input
							readOnly
							disabled
							type="textarea"
							name="privateKey"
							rows="5"
							value={this.state.privateKey}
							onChange={this.handlePrivateKeyChange}
						/>
					</Col>
				</FormGroup>
				<Button type="submit" color="primary">Generate</Button>
			</Form>
		);
	}
}

const numBitsOptions = [2048, 4096];

GenerateKeyForm.propTypes = {
	keyExpirationTime: PropTypes.number.isRequired,
	numBits: PropTypes.oneOf(numBitsOptions).isRequired,
	onPassphraseChange: PropTypes.func.isRequired,
	onPrivateKeyChange: PropTypes.func.isRequired,
	onPublicKeyChange: PropTypes.func.isRequired,
};

GenerateKeyForm.defaultProps = {
	keyExpirationTime: 0,
	numBits: Math.min(...numBitsOptions),
};

export default GenerateKeyForm;
