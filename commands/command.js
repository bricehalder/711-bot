module.exports = {

  Command: class Command {
    constructor() {
      this.names = [];
      this.usage = '';
    }

    async sendUsage(channel) {
      channel.send(`Usage: ${this.usage}`);
    }

    /**
  * Executes the command.
  * @param {string[]} args - The arguments provided for the command.
  * @param {Discord.Message} message - Message.
  * @return {boolean} Success of execution.
  */
    async execute(args) {
      return false;
    };
  },
};
