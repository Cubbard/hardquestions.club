const sha256   = require('sha256');
const date     = require('date-and-time');
const alphabet = require('alphabet');
const User     = require('./User.js');

class Crypto
{
    static randomPepper() {
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
            return false;

        const salt = user.salt;
        const hash = user.pass_hash;
        for (let i = 0; i < 26; i++) {
            for (let j = 0; j < 26; j++)
            {
                let tryStr;

                const first = password.substring(0, Math.floor(password.length / 2));
                const secon = password.substring(Math.floor(password.length / 2));

                tryStr = sha256(first + alphabet[i] + alphabet[j] + secon + salt); // AA
                if (tryStr === hash)
                    return true;
                
                tryStr = sha256(first + alphabet[i] + alphabet[j].toLowerCase() + secon + salt); // Aa
                if (tryStr === hash)
                    return true;

                tryStr = sha256(first + alphabet[i].toLowerCase() + alphabet[j] + secon + salt); // aA
                if (tryStr === hash)
                    return true;

                tryStr = sha256(first + alphabet[i].toLowerCase() + alphabet[j].toLowerCase() + secon + salt); // aa
                if (tryStr === hash)
                    return true;
            }
        }
        return false;
    }

    static hash(message, salt) {
        const first  = message.substring(0, Math.floor(message.length / 2));
        const secon = message.substring(Math.floor(message.length / 2));

        let newMsg = first + this.randomPepper() + secon + salt;
        return sha256(newMsg);
    }

}

module.exports = Crypto;