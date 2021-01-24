const Command = require('./command');

module.exports = {

  Help: class Help extends Command.Command {
    constructor() {
      super();
      this.name = 'help';
      this.aliases = [this.name, '?'];
      this.usage = '';
      this.help = '';
      this.description = '';
    }

    /**
  * Executes the command.
  * @param {string[]} args - The arguments provided for the command.
  * @param {Discord.Message} message - The Discord message calling the command.
  * @return {boolean} Success of execution.
  */
    async execute(args) {
      return false;
    };
  },
};
