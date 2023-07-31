const Discord = require('discord.js');
const { MongoClient } = require('mongodb');
const chalk = require('chalk');
const bot = new Discord.Client();
const token = 'TOKEN HERE';
const mongoURLs = [
  'MONGODB URL HERE',
  'MONGODB URL #2 HERE'
];
let statusMessage = null;
const updateInterval = 6e4;

bot.once('ready', () => {
console.log(chalk.green('[ZENITH MONGO BOT] Bot is online! Created by YoItzPhoenx'));
  bot.user.setPresence({ activity: { name: 'Zenith MongoDB Status Bot created by YoItzPhoenx', type: 'WATCHING' } });
  postStatusEveryMinute();
});

const checkMongoDBStatus = async (mongoURI) => {
  const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    await client.db().command({ ping: 1 });
    return '<:online:1135272054757789806> **Online**';
  } catch (error) {
    return '<:offline:1135357193621864548> **Offline**';
  } finally {
    client.close();
  }
};

const createEmbed = (options) => {
  const { title, description, fields = [], color = '#2F3136', footer, timestamp, thumbnail } = options;

  const embed = new Discord.MessageEmbed()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .addFields(fields);

  if (footer) {
    embed.setFooter(footer.text, footer.iconURL);
  }

  if (timestamp) {
    embed.setTimestamp();
  }

  if (thumbnail) {
    embed.setThumbnail(thumbnail);
  }

  return embed;
};

const updateStatusMessage = async (channel) => {
  try {
    const statusPromises = mongoURLs.map(checkMongoDBStatus);
    const statuses = await Promise.all(statusPromises);
    const fields = mongoURLs.map((url, i) => ({ name: `Server ${i + 1}`, value: `Status: ${statuses[i]}`, inline: true }));
    const embedOptions = {
      title: 'MongoDB Server Status',
      description: 'Status of MongoDB servers:',
      fields,
      color: '#008000', // You can change the color here
      footer: { text: 'Status last updated', iconURL: bot.user.displayAvatarURL() }, // Customize the footer
      timestamp: true, // Add a timestamp to the embed
    };
    const embed = createEmbed(embedOptions);
    statusMessage ? statusMessage.edit(embed) : (statusMessage = await channel.send(embed));
  } catch (error) {
    const embedOptions = {
      title: 'Error',
      description: 'An error occurred while checking MongoDB status.',
      color: '#FF0000', // Customize the color for the error message
    };
    const embed = createEmbed(embedOptions);
    statusMessage ? statusMessage.edit(embed) : (statusMessage = await channel.send(embed));
  }
};

const postStatusEveryMinute = () => {
  const channelID = 'CHANNEL ID HERE';
  const channel = bot.channels.cache.get(channelID);
  if (!channel) return console.error(`Channel with ID ${channelID} not found.`);
  updateStatusMessage(channel);
  setInterval(() => updateStatusMessage(channel), updateInterval);
};

bot.login(token);
