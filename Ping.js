const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const os = require("os");
const process = require("process");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check bot status"),
    
    async execute(interaction) {
        try {
            const config = interaction.client.config;

            if (!interaction.member.roles.cache.has(config.stockerRole)) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle("Access Denied")
                            .setDescription("Stocker role required")
                    ],
                    ephemeral: true
                });
            }

            const initialReply = await interaction.reply({
                content: "Checking status",
                fetchReply: true,
            });

            const latency = initialReply.createdTimestamp - interaction.createdTimestamp;
            const apiPing = interaction.client.ws.ping;

            const total = Math.floor(process.uptime());
            const hrs = Math.floor(total / 3600);
            const mins = Math.floor((total % 3600) / 60);
            const secs = total % 60;

            const memoryUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
            const totalRAM = (os.totalmem() / 1024 / 1024).toFixed(0);

            const embed = new EmbedBuilder()
                .setColor(0x8A2BE2)
                .setTitle("Mochi Status")
                .addFields(
                    { name: "Bot Latency", value: latency + "ms", inline: true },
                    { name: "API Ping", value: apiPing + "ms", inline: true },
                    { name: "Uptime", value: hrs + "h " + mins + "m " + secs + "s", inline: true },
                    { name: "RAM Usage", value: memoryUsed + " / " + totalRAM + " MB", inline: true },
                    { name: "Total Stock", value: interaction.client.stock.length.toString(), inline: true }
                )
                .setFooter({ text: "Requested by " + interaction.user.tag })
                .setTimestamp();

            await interaction.editReply({
                content: null,
                embeds: [embed]
            });
        } catch (error) {
            console.error("Ping error:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle("Error")
                .setDescription("Failed to fetch status")
                .setTimestamp();

            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};
