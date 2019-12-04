import * as openpgp from 'openpgp';

const OpenPGP = {
    decrypt(messageFile, privateKeyFile, passphrase) {
        const message = messageFile;
        const privateKey = privateKeyFile;

        const privKeyObj = openpgp.key.readArmored(privateKey).keys[0];
		if (passphrase !== undefined) {
			privKeyObj.decrypt(passphrase)
				.then(result => console.log(result))
				.catch((error => console.error(error)))
		}

		const options = {
			message: openpgp.message.readArmored(message),
			// publicKeys: openpgp.key.readArmored(publicKey).keys,
			privateKeys: [privKeyObj]
		}
		
		return openpgp.decrypt(options)
			.then(plaintext => {
				const plaintextData = plaintext.data;
				// this.setState({plaintext: plaintextData, message: plaintextData})
                // this.props.onMessageDecrypted(plaintextData);
                return plaintextData;
			})
			.catch(error => console.error(error));
    }
};

export default OpenPGP;