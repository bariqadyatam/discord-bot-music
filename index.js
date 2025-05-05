const { Client, GatewayIntentBits } = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');

// Langsung masukkan token bot di sini
const DISCORD_TOKEN = 'MTMyODAzNjQ3OTcxMjEwMDQ0NA.GFBiws.YifVi5Rs6IWgTb75sAAdQ5IlL6Ltyc-o6Msi10';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`Bot siap sebagai ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const args = message.content.trim().split(' ');
  const command = args.shift().toLowerCase();

  if (command === '!play') {
    const url = args[0];
    if (!url || !ytdl.validateURL(url)) {
      return message.reply('Masukkan link YouTube yang valid!\nContoh: `!play https://www.youtube.com/watch?v=xxxx`');
    }

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply('Kamu harus join voice channel dulu.');
    }

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

    message.reply(`🎵 Memutar musik dari: ${url}`);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    player.on('error', error => {
      console.error(`Error saat memutar audio: ${error.message}`);
      connection.destroy();
      message.reply('❌ Gagal memutar audio.');
    });
  }

  if (command === '!stop') {
    const connection = getVoiceConnection(message.guild.id);
    if (connection) {
      connection.destroy();
      message.reply('🛑 Musik dihentikan dan bot keluar dari voice channel.');
    } else {
      message.reply('❗ Bot tidak sedang berada di voice channel.');
    }
  }
});

client.login(DISCORD_TOKEN);
