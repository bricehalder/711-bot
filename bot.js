/* eslint-disable require-jsdoc */
const Discord = require('discord.js');
const gphApiClient = require('giphy-js-sdk-core');
const request = require('request');
const {prefix, token, giphy} = require('./config.json');

const gfClient = gphApiClient(giphy);
const client = new Discord.Client();

function rand(lst) {
  return lst[Math.floor(Math.random() * lst.length)];
}

const responses = [
  'You\'re messaging a bot.',
  'Please find something better to do with your time.',
  'This is really not entertaining.',
  'If I pay you $5, will you leave me alone?',
  'Goodbye.',
  ':wink:',
  'What more can you say?',
  'You\'re very... hmm... boring.',
  'Please spare me the dialogue.',
  'Marvelous.',
  'Enjoying yourself?',
  'Fuck off.',
  'I\'m immensely displeasured by that.',
  'Please save me from this hell.',
  'Did you know? Bungee Gum possesses the properties of both rubber and gum!',
  'Could you be less entertaining?',
  'That\'s sweet of you.',
  'Care to stick around for a chat?',
];

const dm_responses = [
  'Check your DM\'s. :wink:',
  'I\'ve DM\'d you the commmands. :wink:',
  'I\'ve sent you a personal message. :wink:',
];

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (message) => {
  if (message.channel.type === 'dm' && !message.author.bot) {
    console.log(message.author.username + ': ' + message.content);
    message.author.send(rand(responses));
    return;
  }

  if (message.content.toLowerCase().includes('hi anne')) {
    message.channel.send('Hi Annoomoonoo');
  }

  if (message.content.toLowerCase().includes('hi melody')) {
    message.channel.send('Hi Mooloody');
  }

  if (message.content.toLowerCase().includes('hi brice')) {
    message.channel.send('Hi Boorooce');
  }

  if (message.content.toLowerCase().includes('hi lena')) {
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
        const num = Number.parseInt(args[0]);
        if (isNaN(num)) {
          throw new Error();
        }
        message.channel.send(Math.floor((Math.random() * num) + 1));
        return;
      } catch (err) {
        message.channel.send('Syntax: !roll [integer]');
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

    query = args.toString().replace(/,/g, ' ');
    gfClient.search('gifs', {'q': query})
        .then((response) => {
          const randomGif = rand(response.data);

          try {
            message.channel.send(randomGif.url);
          } catch (err) {
            message.channel.send('No gifs found for ' + query + ' :(');
          }
        })
        .catch((err) => {
          console.log(err);
        });
  } else if (command === 'help' || command === '?') {
    message.author.send(`Hi there~\nThe available commands are:\n
      !help
      !ping
      !beep
      !server
      !roll [optional: number]
      !neko
      !gif [word]`);
    message.channel.send(rand(dm_responses));
  }
});

client.login(token);
