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
const {prefix, token, giphy, deepai, prod, prodIDs, ownerID} = require('./config.json');


DeepAI.setApiKey(deepai);
const gfClient = gphApiClient(giphy);
const client = new Discord.Client();
const gifQ = Queue.queue(3);

const GIF_CHANCE = .25;
const JOJO_CHANCE = .01;

const debug = !prod;

let waitingForResponse;

let claimAlert;
const lastClaimTime = new Map();
const nextClaimTime = new Map();
const claimString = 'The next claim reset is in ';

const notMyFaultPic = 'https://i.imgur.com/TbYPQf5.png';
const pkmnWithHyphenInName = [
  250, 474, 782, 783, 784,
];

const padToThree = (number) => number <= 999 ? `00${number}`.slice(-3) : number;

const sleep = (floor, ceil = floor) => {
  return new Promise((resolve) => setTimeout(resolve, randMillisecondsBtwn(floor, ceil)));
};

function randInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function titleCase(str) {
  let splitStr = str.toLowerCase().split(' ');
  for (let i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(' ');
}

function rand(lst) {
  return lst[Math.floor(Math.random() * lst.length)];
}

function randMillisecondsBtwn(floor, ceil) {
  flr = floor * 1000;
  cl = ceil * 1000;
  return Math.random() * (cl - flr) + flr;
}

function parseClaimStr(claimStr) {
  resetInd = claimStr.indexOf(claimString) + claimString.length;
  timeStr = claimStr.substr(resetInd, 9);
  time = timeStr.split('**')[1];
  if (time.includes('h')) {
    hours = parseInt(time.split('h')[0]);
    mins = parseInt(time.split(' ')[1]);
  } else {
    hours = 0;
    mins = parseInt(time);
  }
  return {hours, mins};
}

function debugPrint(obj) {
  if (debug) console.log(obj);
}

function sendToOwner(message) {
  client.users.fetch(ownerID).then((user) => {
    user.send(message);
  });
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

function testUrl(url) {
  return new Promise((resolve, reject) => {
    request(url, function(error, response, body) {
      if (error) {
        reject (error);
      }
      resolve(response.statusCode);
    });
  });
}

// eslint-disable-next-line no-extend-native
Date.prototype.addTime = function(h, t = 0) {
  this.setTime(this.getTime() + (h * 60 * 60 * 1000) + (t * 60 * 1000));
  return this;
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
  try {
    if (message.guild) {
      if (prodIDs.includes(message.guild.id)) {
        if (!prod) return;
      }
    }

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

    if (message.content.includes('Sefarix') && message.content.includes('married')) {
      lastClaimTime[message.guild.id] = new Date();
      console.log(claimAlert);
      clearTimeout(claimAlert);
      console.log(message.content);
      console.log(claimAlert);
    }

    if (message.content.includes('Sefarix') && message.content.includes(claimString)) {
      const {hours, mins} = parseClaimStr(message.content);
      if (!nextClaimTime[message.guild.id] || lastClaimTime[message.guild.id] > nextClaimTime[message.guild.id]) {
        nextClaimTime[message.guild.id] = new Date().addTime(hours, mins - 5);

        debugPrint(`next alert at ${nextClaimTime[message.guild.id].toLocaleString()}`);
        claimAlert = setTimeout(function() {
          sendToOwner('Time to claim!');
        }, nextClaimTime[message.guild.id] - new Date());
      }
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
      message.channel.send(`The available commands are:\n
        !help
        !ping
        !beep
        !server
        !roll [optional: number]
        !dog | inu
        !cat | neko
        !gif [phrase]
        !hisoka [phrase]
        !say [phrase]
        !eval [math expression]
        !jojo
        !hd | 2x [image link (works best with anime images)]
        !poke | pk | pokemon [pokemon name or #] [optional: shiny | sh]`);
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
    } else if (command === 'pk' || command === 'poke' || command === 'pokemon') {
      /*
      if (prodIDs.includes(message.guild.id)) {
        message.channel.send('Command currently under maintanence. Try again later. :PPP');
        return;
      }*/

      let queryName;
      let queryShiny;
      let shiny;

      if (args[0] === 'shiny' || args[0] === 'sh') {
        shiny = true;
        queryName = args[1];
      } else {
        if (args[1] === 'shiny' || args[1] === 'sh') {
          shiny = true;
        }
        queryName = args[0];
      }
      
      let pkName;
      let pkFlavor = '';
      let alolaFlavor;
      let formCount;
      let formQ;

      new Promise(function(resolve, reject) {
        request.get('https://pokeapi.co/api/v2/pokemon-species/' + queryName.toLowerCase(), {
        }, function(error, response, body) {
          if (!query.length) {
            message.channel.send('Usage: !poke [name of pokemon]');
            return;
          }

          if (!error && response.statusCode === 200) {
            const resp = JSON.parse(body);
            
            pkName = titleCase(resp.name);

            formCount = resp.varieties.length;
            formQ = Queue.queue(formCount);
            for (let i = 0; i < formCount; i++) {
              Queue.append(formQ, resp.varieties[i].pokemon.url);
            }
            
            flavors = resp.flavor_text_entries;
            let i = 0;
            for (i; i < flavors.length; i++) {
              if (flavors[i].language.name === 'en') {
                pkFlavor = flavors[i].flavor_text;
                if (flavors[i].version.name === 'ultra-sun') {
                  break;
                }
              }
            }
            
            for (i; i < flavors.length; i++) {
              if (flavors[i].language.name === 'en') {
                alolaFlavor = flavors[i].flavor_text;
              }
            }

            resolve(Queue.next(formQ));
          } else {
            message.channel.send(`Error finding ${query}. Try again with their National Pokédex number?`);
            return;
          }
        });
      }).then((pkURL) => {
        if (pkURL === '') {
          message.channel.send(`Error finding ${query}. Try again with their National Pokédex number?`);
          return;
        }

        request.get(pkURL, {
        }, function(error, response, body) {
          if (!error && response.statusCode === 200) {
            const resp = JSON.parse(body);
            let imgUrl;

            if (shiny) {
              imgUrl = resp.sprites.front_shiny;
            } else {
              imgUrl = resp.sprites.front_default;
            }

            const pkGif = `https://img.pokemondb.net/sprites/black-white/anim/` + 
            `${shiny ? 'shiny' : 'normal' }/${pkName.toLowerCase()}.gif`;
            const embed = new Discord.MessageEmbed().setImage(resp.id < 650 ? pkGif : imgUrl);
            const alter = formCount > 1;

            let formName = '';

            if (alter) {
              formName = resp.name.split('-')[1];
            }

            embed.setTitle(`**#${padToThree(resp.id)}** ${pkName}`);
            embed.setDescription(`*${pkFlavor}*`);
            embed.setFooter(`${alter && formName ? `${titleCase(formName)} Form` : ''}`);

            FastAverageColor.getAverageColor(imgUrl).then((color) => {
              embed.setColor(color.hex);
              message.channel.send(embed).then((sentMsg) => {
              if (!alter) {
                return;
              }

              sentMsg.react('🥬');

              const filter = (reaction, user) => reaction.emoji.name === '🥬' && user.id !== sentMsg.author.id;
              const collector = sentMsg.createReactionCollector(filter, { max: 20, time: 3 * 60 * 1000 }); // 1 min

              collector.on('collect', async (reaction, user) => {
                pkURL = Queue.next(formQ);

                request.get(pkURL, {
                    }, function(error, response, body) {
                    if (!error && response.statusCode === 200) {
                    const resp = JSON.parse(body);
                    let imgUrl;

                    if (shiny) {
                      imgUrl = resp.sprites.front_shiny;
                    } else {
                      imgUrl = resp.sprites.front_default;
                    }
                    
                    let formName = '';
                    if (resp.name.indexOf('-') > 0) {
                      formName = resp.name.substr(resp.name.indexOf('-') + 1);
                      formName = formName.replace('-', ' ');
                    }

                    if (formName === 'alola') {
                      formName = 'alolan';
                      embed.setDescription(`*${alolaFlavor}*`);
                    } else {
                      embed.setDescription(`*${pkFlavor}*`);
                    }

                    embed.setFooter(`${formName ? `${titleCase(formName)} Form` : ''}`);
                    
                    const searchName = pkName.toLowerCase().concat((formName ? '-' : ''), formName).replace(' ', '-');
                    const pkGif = `https://img.pokemondb.net/sprites/black-white/anim/` + 
                      `${shiny ? 'shiny' : 'normal' }/${searchName}.gif`;
                    const pkFormImg = `https://img.pokemondb.net/sprites/bank/` +
                      `${shiny ? 'shiny' : 'normal'}/${searchName}.png`;

                    const formImgUrl = imgUrl ? imgUrl : pkFormImg;

                    testUrl(pkGif).then((gifStatus) => {
                        if (gifStatus === 200) {
                          embed.setImage(pkGif);
                        }
                        
                        testUrl(formImgUrl).then((statusCode) => {
                            if (gifStatus !== 200 && statusCode === 200) {
                              embed.setImage(formImgUrl);
                            } else if (gifStatus !== 200) {
                              embed.setImage(notMyFaultPic);
                            }
                            
                            FastAverageColor.getAverageColor(imgUrl ? imgUrl : embed.image.url).then((color) => {
                                embed.setColor(color.hex);
                                sentMsg.edit(embed);
                            });

                            reaction.users.remove(user.id);
                        });
                        });
                    }
                    });
              });
              });
            });
          } else {
            message.channel.send(`Error finding ${query}. Try again with their National Pokédex number?`);
          }
        });
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
    } else if (command === 'hd' || command === '2x') {
      if (!query.length) {
        message.channel.send(`Usage: !${command} [image link]\n\nWorks best with anime images.`);
        return;
      }

      (async function() {
       try {
       const resp = await DeepAI.callStandardApi('waifu2x', {
image: query,
});
          imgUrl = resp.output_url;

          const embed = new Discord.MessageEmbed().setImage(imgUrl);

          const color = await FastAverageColor.getAverageColor(imgUrl, {ignoredColor: [0, 0, 0, 255]});
          embed.setColor(color.hex);
          embed.setFooter(`Average color: ${color.hex}`);

          message.channel.send(`Here is your HD waifu/husbando: `);
          message.channel.send(embed);
        } catch (err) {
          message.channel.send('API Error (not my fault).');
          console.log(err);
        }
      })();
    } else if (command === 'test') {
      sendToOwner(query);
    } else {
      console.log(`Unrecognized command: ${command}\n`);
    }
  } catch (err) {
    console.log(err);
  }
});

client.login(token);
