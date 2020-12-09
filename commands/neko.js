const Command = require('./command');
const request = require('request');

module.exports = {
  Neko:
    class Neko extends Command.Command {
      constructor() {
        super();
        this.names = ['neko', 'cat'];
        this.usage = '!neko or !cat';
      }

      /**
    * Executes the command.
    * @param {string[]} args - The arguments provided for the command.
    * @param {Discord.Message} message - Message.
    * @return {boolean} Success of execution.
    */
      async execute(args, message) {
        request.get('http://thecatapi.com/api/images/get?format=src&type=png', {
        }, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            message.channel.send(response.request.uri.href);
          } else {
            console.log(error);
            sendUsage(message.channel);
          }
        });
      };
    },
};
