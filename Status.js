const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("status")
        .setDescription("View current server status"),
    
    async execute(interaction) {
        try {
            const statusConfig = interaction.client.statusConfig;

            if (!statusConfig.channelId) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle("No Status Channel")
                            .setDescription("No status channel set up")
                    ],
                    ephemeral: true
                });
            }

            const statusEmoji = {
                green: "🟢",
                yellow: "🟡",
                red: "🔴"
            }[statusConfig.statusEmoji] || "🟢";

            const embed = new EmbedBuilder()
                .setColor(0x8A2BE2)
                .setTitle("Server Status")
                .setDescription("Current Status: " + statusEmoji)
                .setFooter({ text: "MochiMan" })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Status error:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle("Error")
                .setDescription("Failed to fetch status")
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};
