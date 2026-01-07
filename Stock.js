const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stock")
        .setDescription("View current stock"),
    
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

            const stock = interaction.client.stock;
            const total = stock.length;

            const embed = new EmbedBuilder()
                .setColor(0x8A2BE2)
                .setTitle("Current Stock")
                .setDescription("Total Accounts: " + total)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error("Stock error:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle("Error")
                .setDescription("Failed to fetch stock")
                .setTimestamp();

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};
