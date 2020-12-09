const Command = require('./command');

module.exports = {
  Roll:
    class Roll extends Command.Command {
      constructor() {
        super();
        this.names = ['roll'];
        this.usage = '!roll [integer]';
      }

      /**
    * Executes the command.
    * @param {string[]} args - The arguments provided for the command.
    * @param {Discord.Message} message - Message.
    * @return {boolean} Success of execution.
    */
      async execute(args, message) {
        if (args.length === 0) {
          message.channel.send(Math.floor((Math.random() * 100) + 1));
        } else {
          try {
            const num = Number.parseInt(args[0]);
            if (isNaN(num)) {
              this.sendUsage(message.channel);
              return;
            }
            message.channel.send(Math.floor((Math.random() * num) + 1));
          } catch (err) {
            this.sendUsage(message.channel);
          }
        }
      };
    },
};
