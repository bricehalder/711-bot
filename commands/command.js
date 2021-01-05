module.exports = {

  Command: class Command {
    constructor() {
      this.name = '';
      this.aliases = [this.name];
      this.usage = '';
      this.help = '';
      this.description = this.help;
    }

    async sendUsage(channel) {
      channel.send(`Usage: ${this.usage}`);
    }

    /**
  * Execute handler for the command.
  * @param {string[]} args - The arguments provided for the command.
  * @param {Discord.Message} message - The Discord message calling the command.
  */
    executeHandler(args, message) {
      try {
        this.execute(args, message).then((success) => {
          if (!success) {
            this.sendUsage(message.channel);
          }
        });
      } catch (error) {
        console.log(error);
        this.sendUsage(message.channel);
      }
    };

    /**
  * Executes the command.
  * @param {string[]} args - The arguments provided for the command.
  * @param {Discord.Message} message - The Discord message calling the command.
  * @return {boolean} Success of execution.
  */
    async execute(args, message) {
      return false;
    };
  },
};
