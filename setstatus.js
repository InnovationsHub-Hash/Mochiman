const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setstatus")
        .setDescription("Set status channel and emoji")
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("Select status channel")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("status")
                .setDescription("Set status")
                .setRequired(true)
                .addChoices(
                    { name: "Online", value: "green" },
                    { name: "Busy", value: "yellow" },
                    { name: "Offline", value: "red" }
                )),
    
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const config = interaction.client.config;

            if (!interaction.member.roles.cache.has(config.stockerRole)) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle("Access Denied")
                            .setDescription("Stocker role required")
                    ]
                });
            }

            const channel = interaction.options.getChannel("channel");
            const statusValue = interaction.options.getString("status");

            const statusEmoji = {
                green: "🟢",
                yellow: "🟡", 
                red: "🔴"
            }[statusValue] || "🟢";

            interaction.client.statusConfig = {
                channelId: channel.id,
                statusEmoji: statusValue
            };

            fs.writeFileSync('./status-config.json', JSON.stringify(interaction.client.statusConfig));

            const embed = new EmbedBuilder()
                .setColor(0x8A2BE2)
                .setTitle("Status Updated")
                .setDescription("Status channel set to " + channel.toString() + " with status " + statusEmoji)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error("Setstatus error:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle("Error")
                .setDescription("Failed to set status")
                .setTimestamp();

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};
