const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clearstock")
        .setDescription("Clear all stock"),
    
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
            const clearedCount = stock.length;
            stock.length = 0;

            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle("Stock Cleared")
                .setDescription("Cleared " + clearedCount + " accounts")
                .setFooter({ text: "Cleared by " + interaction.user.tag })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            const logChannel = interaction.client.channels.cache.get(config.stockLogChannel);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle("Stock Cleared")
                    .addFields(
                        { name: "By", value: interaction.user.tag },
                        { name: "Accounts Cleared", value: clearedCount.toString() }
                    )
                    .setTimestamp();

                logChannel.send({ embeds: [logEmbed] });
            }
        } catch (error) {
            console.error("Clearstock error:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle("Error")
                .setDescription("Failed to clear stock")
                .setTimestamp();

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};
