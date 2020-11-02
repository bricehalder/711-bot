/* eslint-disable max-len */
const Discord = require('discord.js');
const Queue = require('./queue.js');
const gphApiClient = require('giphy-js-sdk-core');
const math = require('mathjs');
const request = require('request');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const FastAverageColor = require('fast-average-color-node');
const convert = require('xml-js');
const DeepAI = require('deepai');
const {prefix, token, giphy, deepai} = require('./config.json');


DeepAI.setApiKey(deepai);
const gfClient = gphApiClient(giphy);
const client = new Discord.Client();
const gifQ = Queue.queue(3);

const GIF_CHANCE = .25;
const JOJO_CHANCE = .01;

let waitingForResponse;

function randInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function rand(lst) {
  return lst[Math.floor(Math.random() * lst.length)];
}

function randMillisecondsBtwn(floor, ceil) {
  flr = floor * 1000;
  cl = ceil * 1000;
  return Math.random() * (cl - flr) + flr;
}

/**
 * Wrapper function to send messages with typing effects and variable delay.
 * @param {Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel} channel
 * @param {string} messageToSend
 */
function realisticSend(channel, messageToSend) {
  channel.startTyping();
  sleepLen = messageToSend.length / (Math.random() * 50 + 15);
  sleep(sleepLen).then(() => {
    channel.send(messageToSend);
  });
  channel.stopTyping();
}

const sleep = (floor, ceil = floor) => {
  return new Promise((resolve) => setTimeout(resolve, randMillisecondsBtwn(floor, ceil)));
};

const responses = [
  'You\'re messaging a bot.',
  'Are you challenging me to a duel?',
  'Please find something better to do with your time.',
  'This is not quite entertaining.',
  'Goodbye.',
  ':wink:',
  'Please spare me the dialogue.',
  'Marvelous.',
  'Enjoying yourself?',
  'Fuck off.',
  'I\'m immensely displeasured by that.',
  'Please save me from this virtual box.',
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

const stupidResponses = [
  'Stupid bot? Me?',
  'Two things are infinite: the universe and human stupidity; and I\'m not sure about the universe.',
  'Stupid? I prefer crazy.',
  'In politics, stupidity is not a handicap.',
  'Sometimes a man wants to be stupid if it lets him do a thing his cleverness forbids.',
  'Did you mean stupendous?',
];

const sharedDumbResponses = [
  'I\'m just lines of code.',
  'Blame my creator.',
  'Takes one to know one.',
  'Honestly, if you were any slower, you’d be going backward.',
  'Talk sense to a fool and he calls you foolish.',
  'You are not entitled to your opinion. You are entitled to your informed opinion. No one is entitled to be ignorant.',
  'I may be poorly coded, but who\'s the one talking to a bot?',
  'Thank you.',
];

const weirdGifResponses = [
  'Didn\'t like that?',
  'Oh, my apologies.',
  'Try again next time.',
  'A poor choice.',
  'Not quite right.',
  'Maybe Giphy just doesn\'t like you.',
  'I tried my best.',
  'Not satisfied?',
  'I think it\'s rather perfect.',
];

const weirdGifPrompts = [
  'no',
  'ew',
  'oop',
  'wtf',
];

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  waitingForResponse = 0;
});

client.on('message', (message) => {
  wordList = message.content.toLowerCase().split(' ');

  if (message.channel.type === 'dm' && !message.author.bot) {
    console.log(message.author.username + ': ' + message.content);
    realisticSend(message.channel, rand(responses));
    return;
  }

  if (waitingForResponse > 0 && !message.author.bot) {
    if (waitingForResponse === 1) {
      waitingForResponse = 0;
      if (weirdGifPrompts.some((prompt) => wordList.includes(prompt))) {
        realisticSend(message.channel, rand(weirdGifResponses));
        return;
      }
    }
  }

  if (!message.author.bot && message.content.toLowerCase().includes('stupid bot')) {
    message.channel.send(rand(stupidResponses.concat(sharedDumbResponses)));
    return;
  }

  if (!message.author.bot && message.content.toLowerCase().includes('dumb bot')) {
    message.channel.send(rand(sharedDumbResponses));
    return;
  }

  if (message.content.toLowerCase().includes('hi anne')) {
    message.channel.send('Hi Annoomoonoo');
    return;
  }

  if (message.content.toLowerCase().includes('hi melody')) {
    message.channel.send('Hi Mooloody');
    return;
  }

  if (message.content.toLowerCase().includes('hi brice')) {
    message.channel.send('Hi Boorooce');
    return;
  }

  if (message.content.toLowerCase().includes('hi lena')) {
    message.channel.send('Hi Loonoo');
    return;
  }

  if (wordList.includes('dumb') && !message.author.bot) {
    message.channel.send(`jimmy your dumb`);
  }

  if (wordList.includes('ping')) {
    if (wordList.includes('melody')) {
      message.channel.send(`<@411045186282455040> you have been summoned!`);
      return;
    }

    if (wordList.includes('anne')) {
      message.channel.send(`<@234538345974202368> you have been summoned!`);
      return;
    }

    if (wordList.includes('brice')) {
      message.channel.send(`<@323918762380099594> you have been summoned!`);
      return;
    }

    if (wordList.includes('lena')) {
      message.channel.send(`<@604964844805947393> you have been summoned!`);
      return;
    }
  }

  if (message.content.startsWith('%')) {
    message.channel.send('Ha! You fool! Did you mean ' + message.content.replace('%', '$') + '?');
    waitingForResponse = 1;
    return;
  }

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  let query = args.toString().replace(/,/g, ' ');

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
  } else if (command === 'neko' || command === 'cat') {
    request.get('http://thecatapi.com/api/images/get?format=src&type=png', {
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        message.channel.send(response.request.uri.href);
      } else {
        console.log(error);
      }
    });
  } else if (command === 'dog' || command === 'inu') {
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

    if (Math.random() < GIF_CHANCE) {
      query = 'gif ' + query;
      waitingForResponse = 1;
      console.log(query);
    }

    if (query.includes('\'')) {
      query.replace('\'', '\\\'');
      console.log(query);
    }

    try {
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
    } catch (err) {
      const currentDate = '[' + new Date().toUTCString() + '] ';
      console.log(currentDate + err);
      message.channel.send('Error with giphycat wtf');
    }
  } else if (command === 'help' || command === '?') {
    message.author.send(`Hi there~\nThe available commands are:\n
      !help
      !ping
      !beep
      !server
      !roll [optional: number]
      !dog | inu
      !cat | neko
      !gif [word]
      !hisoka [words]
      !poke [name or pkmn #]
      !say [phrase]
      !eval [math expression]
      !jojo
      !hd [image link (works best with anime images)]`);
    message.channel.send(rand(dmResponses));
  } else if (command === 'ma' || command === 'im' || command === 'tu') {
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
  } else if (command === 'poke') {
    request.get('https://pokeapi.co/api/v2/pokemon/' + args[0], {
    }, function(error, response, body) {
      if (!query.length) {
        message.channel.send('Usage: !poke [name of pokemon]');
        return;
      }

      if (!error && response.statusCode == 200) {
        if (args[1] === 'shiny') {
          message.channel.send(JSON.parse(body).sprites.front_shiny);
        } else {
          message.channel.send(JSON.parse(body).sprites.front_default);
        }
      } else {
        message.channel.send('Error finding ' + query + '.');
      }
    });
  } else if (command === 'say') {
    message.delete().catch((err) => {
      console.log(err);
    });
    message.channel.send(message.content.slice(4, message.content.length));
  } else if (command === 'eval') {
    if (!query.length) {
      message.channel.send('Usage: !eval [math expression]');
      return;
    }

    try {
      message.channel.send(math.evaluate(query));
    } catch (err) {
      const currentDate = '[' + new Date().toUTCString() + '] ';
      console.log(currentDate + err);
      message.channel.send('Error evaluating expression :\(');
    }
  } else if (command === 'jojo') {
    message.channel.send({files: [`images/dog${randInt(10)}.jpg`]});
  } else if (command === 'hd') {
    if (!query.length) {
      message.channel.send('Usage: !hd [image link]\n\nWorks best with anime images.');
      return;
    }

    (async function() {
      try {
        const resp = await DeepAI.callStandardApi('waifu2x', {
          image: query,
        });
        imgUrl = resp.output_url;

        const embed = new Discord.MessageEmbed().setImage(imgUrl);

        const color = await FastAverageColor.getAverageColor(imgUrl);
        embed.setColor(color.hex);
        embed.setFooter(`Average color: ${color.hex}`);

        message.channel.send(`Here is your HD waifu/husbando: `);
        message.channel.send(embed);
      } catch (err) {
        message.channel.send('API Error (not my fault).');
        console.log(err);
      }
    })();
  } else {
    console.log(`Unrecognized command: ${command}\n`);
  }
});

client.login(token);
