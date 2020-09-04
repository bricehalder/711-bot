const Discord = require('discord.js');
const Queue = require('./queue.js');
const gphApiClient = require('giphy-js-sdk-core');
const request = require('request');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const convert = require('xml-js');
const {prefix, token, giphy} = require('./config.json');


const gfClient = gphApiClient(giphy);
const client = new Discord.Client();
const gifQ = Queue.queue(3);

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
  'Please save me from this boredom.',
  'Did you know? Bungee Gum possesses the properties of both rubber and gum!',
  'Could you be less entertaining?',
  'That\'s sweet of you.',
  'Care to stick around for a chat?',
];

const dmResponses = [
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
  const query = args.toString().replace(/,/g, ' ');

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
  } else if (command === 'dog') {
    request.get('https://dog.ceo/api/breeds/image/random', {
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        message.channel.send(JSON.parse(response.body).message);
      } else {
        console.log(error);
      }
    });
  } else if (command === 'gif') {
    if (args.length === 0) {
      message.channel.send('Usage: !gif [word(s)]');
      return;
    }

    gfClient.search('gifs', {'q': query})
        .then((response) => {
          try {
            success = false;
            tries = 0;
            responseSize = response.data.length;
            while (!success && tries < responseSize) {
              tries += 1;

              randIdx = Math.floor(Math.random() * response.data.length);
              const randomGif = response.data[randIdx];

              if (Queue.contains(gifQ, randomGif.url)) {
                response.data.splice(randIdx, 1);
                continue;
              }

              Queue.append(gifQ, randomGif.url);
              message.channel.send(randomGif.url);
              success = true;
            }

            if (!success) {
              message.channel.send('No new gifs found for ' + query + ' :(');
            }
          } catch (err) {
            const currentDate = '[' + new Date().toUTCString() + '] ';
            console.log(currentDate + err);
            message.channel.send('Error with giphycat wtf');
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
      !dog
      !neko
      !gif [word]
      !hisoka [words]`);
    message.channel.send(rand(dmResponses));
  } else if (command === 'ma' || command === 'im') {
    message.channel.send('Ha! You fool! Did you mean $' + command + '?');
  } else if (command === 'hisoka') {
    const xhr = new XMLHttpRequest();
    result = '';

    xhr.open('POST', 'https://www.botlibre.com/rest/api/chat', true);

    xhr.setRequestHeader('Content-Type', 'application/xml');

    // eslint-disable-next-line max-len
    const xml = '<chat application=\'1627452332476840447\' instance=\'165\'><message>' + query + '</message></chat>';
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        result = xhr.responseText;
        const result1 = convert.xml2json(result, {compact: true, spaces: 4});
        const convertedJSON = JSON.parse(result1);
        message.channel.send(convertedJSON.response.message._text);
      }
    };
    xhr.send(xml);
  }
});

client.login(token);
