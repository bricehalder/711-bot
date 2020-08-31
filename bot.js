const Discord = require('discord.js');
const gphApiClient = require('giphy-js-sdk-core');
const request = require('request');
const {prefix, token, giphy} = require('./config.json');

const gfClient = gphApiClient(giphy);
const client = new Discord.Client();


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (message) => {
  if (message.content === 'Hi Anne') {
    message.channel.send('Hi Annoomoonoo');
  }

  if (message.content === 'Hi Melody') {
    message.channel.send('Hi Mooloody');
  }

  if (message.content === 'Hi Brice') {
    message.channel.send('Hi Boorooce');
  }

  if (message.content === 'Hi Lena') {
    message.channel.send('Hi Loonoo');
  }

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    message.channel.send('Pong.');
  } else if (command === 'beep') {
    message.channel.send('Boop.');
  } else if (command === 'server') {
    message.channel.send(`Server name: ${message.guild.name}` +
    `\nTotal members: ${message.guild.memberCount}`);
  } else if (command === 'roll') {
    if (args.length === 0) {
      message.channel.send(Math.floor((Math.random() * 100) + 1));
    } else {
      try {
        message.channel.send(Math.floor((Math.random() * args[0]) + 1));
      } catch (err) {
        message.channel.send('Syntax: !roll [positive number]');
      }
    }
  } else if (command === 'neko') {
    request.get('http://thecatapi.com/api/images/get?format=src&type=png', {
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        message.channel.send(response.request.uri.href);
      } else {
        console.log(error);
      }
    });
  } else if (command === 'gif') {
    if (args.length === 0) {
      message.channel.send('Usage: !gif [word]');
      return;
    }

    gfClient.search('gifs', {'q': args[0]})
        .then((response) => {
          const randomGif = response.data[Math.floor(Math.random() *
            response.data.length)];

          message.channel.send(randomGif.url);
        })
        .catch((err) => {
          console.log(err);
        });
  } else if (command === 'help' || command === '?') {
    message.channel.send(`Available commands:\n
      !help
      !ping
      !beep
      !server
      !roll
      !neko
      !gif`);
  }
});

client.login(token);
