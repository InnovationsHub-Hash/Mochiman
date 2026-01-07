const { Client, Collection, GatewayIntentBits, ActivityType, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();
client.slashCommands = new Collection();
client.stock = [];
client.genCooldown = new Map();

client.statusConfig = {
    channelId: null,
    statusEmoji: 'green'
};

client.config = {
    premiumRole: '1458212569167822868',
    genChannel: '1458213139731447950',
    stockerRole: '1458213624513302701',
    genLogChannel: '1458215182101905610',
    stockLogChannel: '1458215252889047227'
};

if (fs.existsSync('./status-config.json')) {
    const saved = JSON.parse(fs.readFileSync('./status-config.json'));
    client.statusConfig = saved;
}

const commands = [];

const slashCommandsPath = path.join(__dirname, 'commands', 'slash');
const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));

for (const file of slashCommandFiles) {
    const command = require(path.join(slashCommandsPath, file));
    client.slashCommands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

client.once('ready', async () => {
    console.log(client.user.tag + ' is online');
    client.user.setActivity('MochiMan', { type: ActivityType.Watching });
    
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;
    
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Command error:', error);
        
        const errorEmbed = {
            color: 0xFF0000,
            title: 'Error',
            description: 'Command failed',
            timestamp: new Date()
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ embeds: [errorEmbed] });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);
