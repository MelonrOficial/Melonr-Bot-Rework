require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const prefix = config.prefix;

client.once('ready', () => {
  console.log(`Melonr Bot ligado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'falar') {
    const texto = args.join(' ');
    if (!texto) return message.reply('Digite algo para eu falar.');
    message.channel.send(texto);
  }

  if (command === 'mutar') {
    const membro = message.mentions.members.first();
    if (!membro) return message.reply('Mencione alguém para mutar.');
    let muteRole = message.guild.roles.cache.find(role => role.name === "Muted");
    if (!muteRole) {
      muteRole = await message.guild.roles.create({ name: "Muted", permissions: [] });
      message.guild.channels.cache.forEach(channel => {
        channel.permissionOverwrites.create(muteRole, {
          SendMessages: false,
          Speak: false
        });
      });
    }
    membro.roles.add(muteRole);
    message.channel.send(`${membro.user.tag} foi mutado.`);
  }

  if (command === 'banir') {
    const membro = message.mentions.members.first();
    if (!membro) return message.reply('Mencione alguém para banir.');
    if (!membro.bannable) return message.reply('Não consigo banir esse usuário.');
    membro.ban();
    message.channel.send(`${membro.user.tag} foi banido.`);
  }

  if (command === 'ajuda') {
    message.channel.send(`
**Comandos disponíveis:**
- \`!falar [mensagem]\` → O bot fala algo.
- \`!mutar @usuário\` → Muta o usuário.
- \`!banir @usuário\` → Bane o usuário.
- Mensagem de boas-vindas automática.
    `);
  }
});

client.on('guildMemberAdd', member => {
  const canal = member.guild.channels.cache.find(ch => ch.name === config.welcomeChannel);
  if (!canal) return;
  canal.send(`Bem-vindo(a) ${member}!`);
});

client.login(process.env.TOKEN);