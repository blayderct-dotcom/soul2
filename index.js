import 'dotenv/config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { joinVoiceChannel, entersState, VoiceConnectionStatus } from '@discordjs/voice';
import express from 'express';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel]
});

// Express server, .env port ile çalışacak
const app = express();
const PORT = process.env.PORT || 5500;
app.get('/', (req, res) => res.send('Bot çalışıyor!'));
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor.`));

// Bot hazır olunca status ve log
client.once('ready', () => {
    console.log(`Bot ${client.user.tag} olarak giriş yaptı.`);
    client.user.setActivity('💎 Soul Inferno', { type: 3 }); // İzliyor
});

// Mesaj komutları
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const specialRoleId = process.env.SPECIAL_ROLE_ID;
    const args = message.content.trim().split(' ');

    // Komut kontrolleri
    if (args[0] === '.3katıl') {
        if (!message.member.roles.cache.has(specialRoleId)) {
            return message.reply('Bu komutu kullanmak için yetkin yok!');
        }

        const channel = message.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
        if (!channel || !channel.isVoiceBased()) return message.reply('Ses kanalı bulunamadı!');

        try {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
            await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
            message.reply('Ses kanalına bağlandım!');
        } catch (error) {
            console.error(error);
            message.reply('Ses kanalına bağlanırken hata oluştu.');
        }
    }

    if (args[0] === '.3çık') {
        const channel = message.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
        if (!channel || !channel.isVoiceBased()) return message.reply('Ses kanalı bulunamadı!');

        const connection = getVoiceConnection(channel.guild.id);
        if (connection) {
            connection.destroy();
            message.reply('Ses kanalından çıktım!');
        } else {
            message.reply('Ses kanalında zaten yokum.');
        }
    }
});

client.login(process.env.TOKEN);

