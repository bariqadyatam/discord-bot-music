require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (!message.guild || message.author.bot) return;

  const args = message.content.split(' ');
  const command = args.shift().toLowerCase();

  if (command === '!play') {
    const url = args[0];

    if (!url || !ytdl.validateURL(url)) {
      return message.reply('Berikan link YouTube yang valid. Contoh: `!play https://youtube.com/watch?v=xxxxxx`');
    }

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Masuk ke voice channel dulu ya.');

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });

    const stream = ytdl(url, { filter: 'audioonly' });
    const resource = createAudioResource(stream);
    const player = createAudioPlayer();

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    message.reply(`Sedang memutar: ${url}`);
  }

  if (command === '!stop') {
    const connection = getVoiceConnection(message.guild.id);
    if (connection) {
      connection.destroy();
      message.reply('Musik dihentikan dan bot keluar dari voice channel.');
    } else {
      message.reply('Bot tidak sedang di voice channel.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
