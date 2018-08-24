const sha256     = require('sha256');
const date       = require('date-and-time');
const alphabet   = require('alphabet');
const User       = require('./User.js');
const randString = require('random-string');


class Crypto
{
    static getSalt() {
        return randString({ special: true, length: 4 });
    } 

    static getPepper() {
        let randI1, randI2, letter1, letter2, isLower;

        randI1 = Math.floor(Math.random() * 25);
        randI2 = Math.floor(Math.random() * 25);
        while (randI1 === randI2) {
            randI2 = Math.floor(Math.random() * 25);
        }

        letter1 = alphabet[randI1];
        letter2 = alphabet[randI2];
        
        isLower = Math.round(Math.random());
        letter1 = !!isLower ? letter1.toLowerCase() : letter1;

        isLower = Math.round(Math.random());
        letter2 = !!isLower ? letter2.toLowerCase() : letter2;

        return letter1 + letter2;
    }

    static async tryUser(identity, password) {
        let user = await User.query().where('identity', '=', identity).first();
        if (!user)
            return null;

        for (let i = 0; i < 26; i++) {
            for (let j = 0; j < 26; j++) {
                for (let k = 0; k < password.length; k++)
                {
                    let tryHash = [];
                    // AA
                    tryHash.push(sha256(password.substring(0, k) 
                        + alphabet[i] + alphabet[j] + password.substring(k) + user.salt));

                    // Aa
                    tryHash.push(sha256(password.substring(0, k) 
                        + alphabet[i] + alphabet[j].toLowerCase() + password.substring(k) + user.salt));

                    // aA
                    tryHash.push(sha256(password.substring(0, k) 
                        + alphabet[i].toLowerCase() + alphabet[j] + password.substring(k) + user.salt));

                    // aa
                    tryHash.push(sha256(password.substring(0, k) 
                        + alphabet[i].toLowerCase() + alphabet[j].toLowerCase() + password.substring(k) + user.salt));

                    if (tryHash.includes(user.pass_hash)) return user;
                }

            }
        }
        return null;
    }

    static getHash(message) {
        const mLength = message.length;
        const randPos = Math.floor(Math.random() * mLength);

        return sha256(message.substring(0, randPos) + this.getPepper() + message.substring(randPos) + this.getSalt());
    }

}

module.exports = Crypto;