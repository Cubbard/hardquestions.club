const forms  = require('forms'),
      fields = forms.fields,
      valids = forms.validators;
      
const loginForm = forms.create({
    identity: fields.string({ required: true }),
    password: fields.password({ required: valids.minlength(8, 'Must contain at least 8 characters!')})
});

module.exports = { loginForm };