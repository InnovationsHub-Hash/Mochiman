const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addstock")
        .setDescription("Add accounts to stock")
        .addStringOption(option =>
            option.setName("accounts")
                .setDescription("Enter accounts (one per line)")
                .setRequired(true)),
    
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

            const accountsText = interaction.options.getString("accounts");
            const accounts = accountsText.split('\n').filter(acc => acc.trim() !== '');

            if (accounts.length === 0) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle("No Accounts")
                            .setDescription("Provide valid accounts")
                    ]
                });
            }

            const stock = interaction.client.stock;
            const beforeCount = stock.length;
            stock.push(...accounts);
            const afterCount = stock.length;

            const embed = new EmbedBuilder()
                .setColor(0x8A2BE2)
                .setTitle("Stock Updated")
                .setDescription("Added " + accounts.length + " accounts")
                .addFields(
                    { name: "Added", value: accounts.length.toString(), inline: true },
                    { name: "Previous", value: beforeCount.toString(), inline: true },
                    { name: "New Total", value: afterCount.toString(), inline: true }
                )
                .setFooter({ text: "Added by " + interaction.user.tag })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            const logChannel = interaction.client.channels.cache.get(config.stockLogChannel);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor(0x8A2BE2)
                    .setTitle("Stock Added")
                    .addFields(
                        { name: "By", value: interaction.user.tag, inline: true },
                        { name: "Added", value: accounts.length.toString(), inline: true },
                        { name: "Total", value: afterCount.toString(), inline: true }
                    )
                    .setTimestamp();

                logChannel.send({ embeds: [logEmbed] });
            }
        } catch (error) {
            console.error("Addstock error:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle("Error")
                .setDescription("Failed to add stock")
                .setTimestamp();

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};
