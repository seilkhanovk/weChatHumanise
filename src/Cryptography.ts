require('dotenv').config()

const crypto = require('crypto')
const algorithm = 'aes-256-cbc';

const { TOKEN_KEY, TOKEN_IV } = process.env

export class Cryptography {

    // static readonly key = crypto.randomBytes(32)
    static readonly iv = crypto.randomBytes(16);

    public static encrypt(text) {

        let cipher = crypto.createCipheriv(algorithm, Buffer.from(TOKEN_KEY), this.iv);

        let encrypted = cipher.update(text);

        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return { iv: this.iv.toString('hex'), encryptedData: encrypted.toString('hex') };
    }

    public static decrypt(text) {

        let iv = Buffer.from(TOKEN_IV, 'hex');
        let key = Buffer.from(TOKEN_KEY, 'hex')
        let encryptedText = Buffer.from(text, 'hex');

        let decipher = crypto.createDecipheriv(algorithm, key, iv);

        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    }
}