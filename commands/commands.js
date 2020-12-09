const Roll = require('./roll');
const Neko = require('./neko');


module.exports = {
  commands: function() {
    return [Roll.Roll, Neko.Neko];
  },
};
