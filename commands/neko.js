const Command = require('./command');
const request = require('request');

module.exports = {
  Neko:
    class Neko extends Command.Command {
      constructor() {
        super();
        this.name = 'neko';
        this.aliases = [this.name, 'cat'];
        this.usage = '!neko or !cat';
        this.help = 'Sends a random image of a cat.';
        this.description = this.help;
      }

      /**
    * Executes the command.
    * @param {string[]} args - The arguments provided for the command.
    * @param {Discord.Message} message - The Discord message calling the command.
    * @return {boolean} Success of execution.
    */
      async execute(args, message) {
        request.get('http://thecatapi.com/api/images/get?format=src&type=png', {
        }, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            message.channel.send(response.request.uri.href);
          } else {
            if (error) throw error;
            return false;
          }
          return true;
        });
      };
    },
};
