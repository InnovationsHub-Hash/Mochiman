const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gen")
        .setDescription("Generate an account"),
    
    async execute(interaction) {
        try {
            const config = interaction.client.config;
            const genChannelId = config.genChannel;

            if (!interaction.guild) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x8A2BE2)
                            .setTitle("DMs Disabled")
                            .setDescription("Use this command in server")
                    ],
                    ephemeral: true
                });
            }

            if (interaction.channel.id !== genChannelId) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x8A2BE2)
                            .setTitle("Wrong Channel")
                            .setDescription("Use correct channel only")
                    ],
                    ephemeral: true
                });
            }

            const stock = interaction.client.stock;
            
            if (!stock || stock.length === 0) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle("Out of Stock")
                            .setDescription("No accounts available")
                    ],
                    ephemeral: true
                });
            }

            const cooldown = interaction.client.genCooldown;
            const key = interaction.user.id;

            const now = Date.now();
            const isPremium = interaction.member.roles.cache.has(config.premiumRole);
            const cdTime = isPremium ? 10 * 60 * 1000 : 4 * 60 * 60 * 1000;

            if (cooldown.has(key)) {
                const expires = cooldown.get(key);
                if (now < expires) {
                    const remaining = expires - now;
                    const hours = Math.floor(remaining / (60 * 60 * 1000));
                    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(0x8A2BE2)
                                .setTitle("Cooldown Active")
                                .setDescription("Wait " + hours + "h " + minutes + "m for another account")
                        ],
                        ephemeral: true
                    });
                }
            }

            cooldown.set(key, now + cdTime);
            const account = stock.shift();

            const dmEmbed = new EmbedBuilder()
                .setColor(0x8A2BE2)
                .setTitle("YOUR ACCOUNT HAS BEEN GENERATED")
                .setDescription("```" + account + "```")
                .addFields({
                    name: "Important",
                    value: "Enjoy! These accounts have been aged. You may generate another account in 4 hours, or if you're premium, 10 minutes!"
                })
                .setFooter({ text: "Made by hasintheking | MochiMan" })
                .setTimestamp();

            let dmSent = true;
            try {
                await interaction.user.send({ embeds: [dmEmbed] });
            } catch {
                dmSent = false;
            }

            const publicEmbed = new EmbedBuilder()
                .setColor(0x8A2BE2)
                .setTitle("Account Generated")
                .setDescription(dmSent ? "Account sent to DMs" : "Enable DMs from server members")
                .setTimestamp();

            await interaction.reply({ embeds: [publicEmbed] });

            const logChannel = interaction.client.channels.cache.get(config.genLogChannel);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor(0x8A2BE2)
                    .setTitle("Account Generated")
                    .addFields(
                        { name: "User", value: interaction.user.tag, inline: true },
                        { name: "Premium", value: isPremium ? "Yes" : "No", inline: true },
                        { name: "DM Sent", value: dmSent ? "Yes" : "No", inline: true },
                        { name: "Stock Left", value: stock.length.toString(), inline: true }
                    )
                    .setTimestamp();

                logChannel.send({ embeds: [logEmbed] });
            }
        } catch (error) {
            console.error("Gen error:", error);
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle("Error")
                        .setDescription("Try again later")
                ],
                ephemeral: true
            });
        }
    },
};
