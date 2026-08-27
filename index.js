const fs = require('fs');
const http = require('http');
const net = require('net');
const path = require('path');

require('dotenv').config();

const lockPath = path.join(__dirname, 'bot.lock');

const healthServer = http.createServer((request, response) => {

    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Bot online');

});

healthServer.listen(
    Number(process.env.PORT) || 3000,
    '0.0.0.0'
);

try {

    const lockFile = fs.openSync(lockPath, 'wx');

    fs.writeFileSync(lockFile, String(process.pid));
    fs.closeSync(lockFile);

} catch (error) {

    if (error.code === 'EEXIST') {

        const existingPid = Number(
            fs.readFileSync(lockPath, 'utf8').trim()
        );

        try {

            process.kill(existingPid, 0);

            console.error(
                `❌ Il bot è già in esecuzione (PID ${existingPid}).`
            );

            process.exit(1);

        } catch {

            fs.unlinkSync(lockPath);

        }

    } else {

        throw error;

    }

}

function releaseBotLock() {

    try {

        fs.unlinkSync(lockPath);

    } catch {

        // Il lock è già stato rimosso.

    }

}

process.on('exit', releaseBotLock);

const instanceServer = net.createServer();

instanceServer.on(
    'error',
    error => {

        if (error.code === 'EADDRINUSE') {

            console.error(
                '❌ Il bot è già in esecuzione in un altro terminale.'
            );

            process.exit(1);

        }

        throw error;

    }
);

instanceServer.listen(
    38147,
    '127.0.0.1'
);

const {
    Client,
    GatewayIntentBits,
    Partials,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    PermissionsBitField,
    ChannelType,
    REST,
    Routes,
    SlashCommandBuilder,
    ActivityType
} = require('discord.js');

const sqlite3 = require('sqlite3').verbose();

// =====================================================
// CLIENT DISCORD
// =====================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.User,
        Partials.GuildMember,
        Partials.Channel,
        Partials.Message
    ]
});

// =====================================================
// DATABASE SQLITE
// =====================================================

const db = new sqlite3.Database(
    './database.sqlite',
    (error) => {

        if (error) {

            console.error(
                '❌ Errore apertura database:',
                error
            );

            return;

        }

        console.log(
            '✅ Database SQLite collegato.'
        );

    }
);

// =====================================================
// CONFIGURAZIONE BOT
// =====================================================

const TOKEN =
    process.env.TOKEN;

const CLIENT_ID =
    process.env.CLIENT_ID;

const GUILD_ID =
    process.env.GUILD_ID;

// =====================================================
// CANALI
// =====================================================

const WELCOME_CHANNEL_ID =
    process.env.WELCOME_CHANNEL_ID;

const LOG_CHANNEL_ID =
    process.env.LOG_CHANNEL_ID;

const BOT_LOG_CHANNEL_ID =
    process.env.BOT_LOG_CHANNEL_ID;

const MOD_LOG_CHANNEL_ID =
    process.env.MOD_LOG_CHANNEL_ID;

const BAN_LOG_CHANNEL_ID =
    process.env.BAN_LOG_CHANNEL_ID;

const SANCTIONS_CHANNEL_ID =
    process.env.SANCTIONS_CHANNEL_ID;

const TICKET_PANEL_CHANNEL_ID =
    process.env.TICKET_PANEL_CHANNEL_ID;

const TICKET_CATEGORY_ID =
    process.env.TICKET_CATEGORY_ID;

const CLAIMED_TICKET_CATEGORY_ID =
    process.env.CLAIMED_TICKET_CATEGORY_ID;

const FAZIONI_PANEL_CHANNEL_ID =
    process.env.FAZIONI_PANEL_CHANNEL_ID;

const FAZIONI_OPEN_CATEGORY_ID =
    process.env.FAZIONI_OPEN_CATEGORY_ID;

const FAZIONI_CLAIMED_CATEGORY_ID =
    process.env.FAZIONI_CLAIMED_CATEGORY_ID;

const VERIFICATION_CHANNEL_ID =
    process.env.VERIFICATION_CHANNEL_ID;

const PARTNERSHIP_CHANNEL_ID =
    process.env.PARTNERSHIP_CHANNEL_ID;

const COUNTING_CHANNEL_ID =
    process.env.COUNTING_CHANNEL_ID;

const CONVOCATIONS_CHANNEL_ID =
    process.env.CONVOCATIONS_CHANNEL_ID;

const AI_CHANNEL_ID =
    process.env.AI_CHANNEL_ID;

const ALLIANCE_CATEGORY_ID =
    process.env.ALLIANCE_CATEGORY_ID;

const CITIZENS_ROLE_ID =
    process.env.CITIZENS_ROLE_ID;

// =====================================================
// RUOLI
// =====================================================

const STAFF_ROLE_ID =
    process.env.STAFF_ROLE_ID;

const MOD_ROLE_ID =
    process.env.MOD_ROLE_ID;

const ADMIN_ROLE_ID =
    process.env.ADMIN_ROLE_ID;

const GESTIONALE_ROLE_ID =
    process.env.GESTIONALE_ROLE_ID;

const PARTNERSHIP_ROLE_ID =
    process.env.PARTNERSHIP_ROLE_ID;

const VERIFIED_ROLE_ID =
    process.env.VERIFIED_ROLE_ID;

const ROBLOX_VERIFIED_ROLE_ID =
    process.env.ROBLOX_VERIFIED_ROLE_ID;

const COUNTING_BYPASS_ROLE_ID =
    process.env.COUNTING_BYPASS_ROLE_ID;

const CONVOCATION_ROLE_ID =
    process.env.CONVOCATION_ROLE_ID;

const FDO_ROLE_ID =
    process.env.FDO_ROLE_ID;

const SANITARI_ROLE_ID =
    process.env.SANITARI_ROLE_ID;

const ANTINCENDIO_ROLE_ID =
    process.env.ANTINCENDIO_ROLE_ID;

const STRADALE_ROLE_ID =
    process.env.STRADALE_ROLE_ID;

// =====================================================
// API
// =====================================================

const AI_RESPONSE_API_KEY =
    process.env.AI_RESPONSE_API_KEY;

const AI_MODERATION_API_KEY =
    process.env.AI_MODERATION_API_KEY;

// =====================================================
// ROBLOX
// =====================================================

const ROBLOX_GROUP_ID =
    process.env.ROBLOX_GROUP_ID;

const ROBLOX_COOKIE =
    process.env.ROBLOX_COOKIE;

// =====================================================
// REST DISCORD
// =====================================================

const rest = new REST({
    version: '10'
}).setToken(TOKEN);

// =====================================================
// DATABASE - TABELLE
// =====================================================

db.serialize(() => {

    // =========================
    // UTENTI
    // =========================

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            userId TEXT PRIMARY KEY,
            guildId TEXT NOT NULL,
            joinedAt INTEGER NOT NULL
        )
    `);

    // =========================
    // TICKET
    // =========================

    db.run(`
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            channelId TEXT UNIQUE NOT NULL,

            userId TEXT NOT NULL,

            type TEXT NOT NULL,

            status TEXT DEFAULT 'open',

            claimedBy TEXT DEFAULT NULL,

            claimedAt INTEGER DEFAULT NULL,

            createdAt INTEGER NOT NULL,

            ticketNumber INTEGER DEFAULT NULL,

            closedAt INTEGER DEFAULT NULL,

            closedBy TEXT DEFAULT NULL,

            closeReason TEXT DEFAULT NULL
        )
    `);

    db.run(
        `ALTER TABLE tickets ADD COLUMN ticketNumber INTEGER DEFAULT NULL`,
        error => {

            if (error && !error.message.includes('duplicate column name')) {

                console.error(
                    '❌ Errore migrazione tickets:',
                    error
                );

            }

        }
    );

    db.run(`
        CREATE TABLE IF NOT EXISTS ticket_counter (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            currentNumber INTEGER NOT NULL DEFAULT 0
        )
    `);

    db.run(
        `INSERT OR IGNORE INTO ticket_counter (id, currentNumber) VALUES (1, 0)`
    );

    // =========================
    // RICHIAMI
    // =========================

    db.run(`
        CREATE TABLE IF NOT EXISTS warnings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            userId TEXT NOT NULL,

            guildId TEXT NOT NULL,

            moderatorId TEXT NOT NULL,

            reason TEXT NOT NULL,

            createdAt INTEGER NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS message_moderation (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT NOT NULL,
            guildId TEXT NOT NULL,
            deletedAt INTEGER NOT NULL,
            reason TEXT NOT NULL
        )
    `);

    // =========================
    // VERIFICHE
    // =========================

    db.run(`
        CREATE TABLE IF NOT EXISTS verifications (
            userId TEXT PRIMARY KEY,

            guildId TEXT NOT NULL,

            robloxId TEXT DEFAULT NULL,

            robloxUsername TEXT DEFAULT NULL,

            verified INTEGER DEFAULT 0,

            verifiedAt INTEGER DEFAULT NULL
        )
    `);

    db.run(
        `ALTER TABLE verifications ADD COLUMN discordVerified INTEGER DEFAULT 0`,
        error => {

            if (error && !error.message.includes('duplicate column name')) {

                console.error(
                    '❌ Errore migrazione verifications:',
                    error
                );

            }

        }
    );

    db.run(
        `ALTER TABLE verifications ADD COLUMN robloxVerified INTEGER DEFAULT 0`,
        error => {

            if (error && !error.message.includes('duplicate column name')) {

                console.error(
                    '❌ Errore migrazione verifications:',
                    error
                );

            }

        }
    );

    db.run(
        `ALTER TABLE verifications ADD COLUMN robloxId TEXT DEFAULT NULL`,
        error => {

            if (error && !error.message.includes('duplicate column name')) {

                console.error(
                    '❌ Errore migrazione verifications:',
                    error
                );

            }

        }
    );

    // =========================
    // COUNTING
    // =========================

    db.run(`
        CREATE TABLE IF NOT EXISTS counting (
            guildId TEXT PRIMARY KEY,

            currentNumber INTEGER DEFAULT 0,

            lastUserId TEXT DEFAULT NULL
        )
    `);

    // =========================
    // CONVOCAZIONI
    // =========================

    db.run(`
        CREATE TABLE IF NOT EXISTS convocations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            targetId TEXT NOT NULL,

            moderatorId TEXT NOT NULL,

            reason TEXT NOT NULL,

            createdAt INTEGER NOT NULL
        )
    `);

    db.run(
        `ALTER TABLE convocations ADD COLUMN guildId TEXT`,
        error => {

            if (error && !error.message.includes('duplicate column name')) {

                console.error(
                    '❌ Errore migrazione convocations:',
                    error
                );

            }

        }
    );

    db.run(
        `ALTER TABLE convocations ADD COLUMN userId TEXT`,
        error => {

            if (error && !error.message.includes('duplicate column name')) {

                console.error(
                    '❌ Errore migrazione convocations:',
                    error
                );

            }

        }
    );

    db.run(
        `ALTER TABLE convocations ADD COLUMN staffId TEXT`,
        error => {

            if (error && !error.message.includes('duplicate column name')) {

                console.error(
                    '❌ Errore migrazione convocations:',
                    error
                );

            }

        }
    );

    console.log(
        '✅ Tabelle database verificate.'
    );

});

// =====================================================
// FUNZIONI DATABASE
// =====================================================

function ensureUser(
    userId,
    guildId
) {

    db.run(
        `
        INSERT OR IGNORE INTO users
        (
            userId,
            guildId,
            joinedAt
        )
        VALUES (?, ?, ?)
        `,
        [
            userId,
            guildId,
            Date.now()
        ]
    );

}

function getNextTicketNumber() {

    return new Promise((resolve, reject) => {

        db.run(
            `
            UPDATE ticket_counter
            SET currentNumber =
                CASE
                    WHEN currentNumber >= 150 THEN 1
                    ELSE currentNumber + 1
                END
            WHERE id = 1
            `,
            error => {

                if (error) {

                    return reject(error);

                }

                db.get(
                    `SELECT currentNumber FROM ticket_counter WHERE id = 1`,
                    (selectError, row) => {

                        if (selectError) {

                            return reject(selectError);

                        }

                        resolve(row.currentNumber);

                    }
                );

            }
        );

    });

}

// =====================================================
// FUNZIONE LOG
// =====================================================

async function sendLog(
    channelId,
    embed
) {

    try {

        if (!channelId) return;

        const channel =
            await client.channels.fetch(
                channelId
            );

        if (!channel) return;

        await channel.send({
            embeds: [embed]
        });

    } catch (error) {

        console.error(
            '❌ Errore invio log:',
            error
        );

    }

}

const processedEventIds = new Set();

function isDuplicateEvent(
    eventId
) {

    if (processedEventIds.has(eventId)) return true;

    processedEventIds.add(eventId);

    if (processedEventIds.size > 5000) {

        processedEventIds.delete(
            processedEventIds.values().next().value
        );

    }

    return false;

}

// =====================================================
// FUNZIONE SANZIONI PUBBLICHE
// =====================================================

async function sendPublicSanction(
    title,
    description
) {

    try {

        if (
            !SANCTIONS_CHANNEL_ID
        ) return;

        const channel =
            await client.channels.fetch(
                SANCTIONS_CHANNEL_ID
            );

        if (!channel) return;

        const embed =
            new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle(title)
                .setDescription(
                    description
                )
                .setTimestamp();

        await channel.send({
            embeds: [embed]
        });

    } catch (error) {

        console.error(
            '❌ Errore sanzioni pubbliche:',
            error
        );

    }

}

// =====================================================
// COMANDI SLASH
// =====================================================

const commands = [

    // =================================================
    // TICKET
    // =================================================

    new SlashCommandBuilder()
        .setName('aggiungi-utente')
        .setDescription('Aggiunge un utente al ticket')
        .addUserOption(option =>
            option
                .setName('utente')
                .setDescription('Utente da aggiungere')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('rimuovi-utente')
        .setDescription('Rimuove un utente dal ticket')
        .addUserOption(option =>
            option
                .setName('utente')
                .setDescription('Utente da rimuovere')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('reclama')
        .setDescription('Reclama il ticket'),

    new SlashCommandBuilder()
        .setName('rilascia')
        .setDescription('Rilascia il ticket'),

    new SlashCommandBuilder()
        .setName('chiudi')
        .setDescription('Chiude il ticket'),

    new SlashCommandBuilder()
        .setName('ticket-info')
        .setDescription('Mostra le informazioni del ticket'),

    new SlashCommandBuilder()
        .setName('panello-fazioni')
        .setDescription('Invia il pannello ticket delle fazioni'),

    new SlashCommandBuilder()
        .setName('pannelo-fazioni')
        .setDescription('Alias di panello-fazioni'),

    new SlashCommandBuilder()
        .setName('alleanza')
        .setDescription('Crea un canale per la zona alleanza e avvisa i cittadini')
        .addStringOption(option =>
            option
                .setName('nome')
                .setDescription('Nome del nuovo canale')
                .setRequired(false)
        ),

    // =================================================
    // MODERAZIONE
    // =================================================

    new SlashCommandBuilder()
        .setName('richiamo')
        .setDescription('Assegna un richiamo ad un utente')
        .addUserOption(option =>
            option
                .setName('utente')
                .setDescription('Utente da richiamare')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('motivo')
                .setDescription('Motivo del richiamo')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('richiami')
        .setDescription('Visualizza i richiami di un utente')
        .addUserOption(option =>
            option
                .setName('utente')
                .setDescription('Utente')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('cancellarichiami')
        .setDescription('Cancella i richiami di un utente')
        .addUserOption(option =>
            option
                .setName('utente')
                .setDescription('Utente')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Mette un utente in timeout')
        .addUserOption(option =>
            option
                .setName('utente')
                .setDescription('Utente')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('minuti')
                .setDescription('Durata del timeout')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320)
        )
        .addStringOption(option =>
            option
                .setName('motivo')
                .setDescription('Motivo del timeout')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Rimuove il timeout')
        .addUserOption(option =>
            option
                .setName('utente')
                .setDescription('Utente')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banna un utente da Discord')
        .addUserOption(option =>
            option
                .setName('utente')
                .setDescription('Utente da bannare')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('motivo')
                .setDescription('Motivo del ban')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Rimuove il ban')
        .addStringOption(option =>
            option
                .setName('utente')
                .setDescription('ID Discord dell’utente')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Espelle un utente')
        .addUserOption(option =>
            option
                .setName('utente')
                .setDescription('Utente da espellere')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('motivo')
                .setDescription('Motivo dell’espulsione')
                .setRequired(true)
        ),

    // =================================================
    // PARTNERSHIP
    // =================================================

    new SlashCommandBuilder()
        .setName('partnership')
        .setDescription('Crea una nuova partnership')
        .addUserOption(option =>
            option
                .setName('rappresentante')
                .setDescription('Rappresentante del server')
                .setRequired(true)
        ),

    // =================================================
    // CONVOCAZIONI
    // =================================================

    new SlashCommandBuilder()
        .setName('convoca')
        .setDescription('Convoca un utente')
        .addUserOption(option =>
            option
                .setName('utente')
                .setDescription('Utente da convocare')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('motivo')
                .setDescription('Motivo della convocazione')
                .setRequired(true)
        ),

    // =================================================
    // VERIFICA
    // =================================================

    new SlashCommandBuilder()
        .setName('pannello-verifica')
        .setDescription('Invia il pannello di verifica'),

    // =================================================
    // COUNTING
    // =================================================

    new SlashCommandBuilder()
        .setName('counting-reset')
        .setDescription('Resetta il sistema counting'),

    // =================================================
    // UTILITY
    // =================================================

    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Controlla la latenza del bot'),

    new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Mostra l’avatar di un utente')
        .addUserOption(option =>
            option
                .setName('utente')
                .setDescription('Utente')
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Mostra le informazioni di un utente')
        .addUserOption(option =>
            option
                .setName('utente')
                .setDescription('Utente')
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Mostra le informazioni del server')

];

// =====================================================
// EVENTO READY
// =====================================================

client.once('ready', async () => {

    await client.user.setPresence({
        status: 'dnd',
        activities: [
            {
                name: 'EIRP ON TOP!',
                type: ActivityType.Watching
            }
        ]
    });

    console.log('');
    console.log('========================================');
    console.log(`🤖 Bot online: ${client.user.tag}`);
    console.log(`🆔 ID: ${client.user.id}`);
    console.log('========================================');

    try {

        await rest.put(
            Routes.applicationGuildCommands(
                CLIENT_ID,
                GUILD_ID
            ),
            {
                body: commands.map(
                    command => command.toJSON()
                )
            }
        );

        console.log(
            '✅ Comandi slash registrati.'
        );

    } catch (error) {

        console.error(
            '❌ Errore registrazione comandi:',
            error
        );

    }

    await restorePartnershipDepartures();

    // =================================================
    // LOG AVVIO BOT
    // =================================================

    if (BOT_LOG_CHANNEL_ID) {

        const embed =
            new EmbedBuilder()
                .setColor('#00FF88')
                .setTitle('🤖 Bot Online')
                .setDescription(
                    `Il bot è stato avviato correttamente.\n\n` +
                    `👤 **Account:** ${client.user}\n` +
                    `🆔 **ID:** \`${client.user.id}\`\n` +
                    `📡 **Server:** ${client.guilds.cache.size}`
                )
                .setTimestamp();

        await sendLog(
            BOT_LOG_CHANNEL_ID,
            embed
        );

    }

});

// =====================================================
// GESTIONE ERRORI
// =====================================================

client.on(
    'error',
    error => {

        console.error(
            '❌ Errore Discord:',
            error
        );

    }
);

process.on(
    'unhandledRejection',
    error => {

        console.error(
            '❌ Promise non gestita:',
            error
        );

    }
);

process.on(
    'uncaughtException',
    error => {

        console.error(
            '❌ Errore non gestito:',
            error
        );

    }
);

// =====================================================
// SISTEMA BENVENUTO
// =====================================================

client.on(
    'guildMemberAdd',
    async member => {

        ensureUser(
            member.id,
            member.guild.id
        );

        await deletePartnershipDeparture(
            member.guild.id,
            member.id
        ).catch(() => {});

        const departureTimerKey = `${member.guild.id}:${member.id}`;
        const departureTimer = partnershipDepartureTimers.get(departureTimerKey);

        if (departureTimer) {
            clearTimeout(departureTimer);
            partnershipDepartureTimers.delete(departureTimerKey);
        }

        const joinNow = Date.now();
        const joins = (recentJoins.get(member.guild.id) || [])
            .filter(timestamp => joinNow - timestamp < 10000);
        joins.push(joinNow);
        recentJoins.set(member.guild.id, joins);

        if (joins.length >= 5 && member.moderatable) {

            await member.timeout(
                10 * 60 * 1000,
                'Anti-raid: ingresso durante un picco di accessi'
            ).catch(() => {});

            await sendLog(
                MOD_LOG_CHANNEL_ID || LOG_CHANNEL_ID,
                new EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle('🚨 Anti-raid attivo')
                    .setDescription(
                        `Il membro ${member.user} è stato limitato per un picco di ingressi (${joins.length} in 10 secondi).`
                    )
                    .setTimestamp()
            );

        }

        console.log(
            `👋 Nuovo membro: ${member.user.tag}`
        );

        const safetyCheck = await assessNewMember(member);

        if (safetyCheck.isSuspicious && member.moderatable) {

            await member.timeout(
                10 * 60 * 1000,
                `Verifica automatica ingresso: ${safetyCheck.reasons.join(', ')}`
            ).catch(() => {});

            await sendLog(
                MOD_LOG_CHANNEL_ID || LOG_CHANNEL_ID,
                new EmbedBuilder()
                    .setColor('#FEE75C')
                    .setTitle('🛡️ Verifica automatica nuovo membro')
                    .setDescription(
                        `👤 **Utente:** ${member.user}\n` +
                        `📋 **Motivi:** ${safetyCheck.reasons.join(', ')}\n` +
                        '⏱️ **Azione:** timeout preventivo di 10 minuti.'
                    )
                    .setTimestamp()
            );

        }

        // =================================================
        // MESSAGGIO CANALE
        // =================================================

        try {

            if (WELCOME_CHANNEL_ID) {

                const channel =
                    await client.channels.fetch(
                        WELCOME_CHANNEL_ID
                    );

                if (channel) {

                    const avatar =
                        member.user.displayAvatarURL({
                            extension: 'png',
                            size: 1024
                        });

                    const embed =
                        new EmbedBuilder()
                            .setColor('#5865F2')
                            .setAuthor({
                                name:
                                    `${member.user.username} è entrato nel server!`,
                                iconURL: avatar
                            })
                            .setTitle(
                                '🎉 Benvenuto nella nostra community!'
                            )
                            .setDescription(
                                `Ciao ${member}, siamo felici di averti con noi! ❤️\n\n` +
                                `👤 **Utente:** ${member.user}\n` +
                                `📊 **Membri:** ${member.guild.memberCount}\n\n` +
                                `📖 Dai un'occhiata al regolamento e scopri la nostra community!\n\n` +
                                `🎫 Hai bisogno di assistenza? Puoi aprire un ticket.`
                            )
                            .setThumbnail(avatar)
                            .setFooter({
                                text:
                                    `Benvenuto • ${member.guild.name}`
                            })
                            .setTimestamp();

                    await channel.send({
                        content:
                            `👋 Benvenuto ${member}!`,
                        embeds: [
                            embed
                        ]
                    });

                }

            }

        } catch (error) {

            console.error(
                '❌ Errore messaggio benvenuto:',
                error
            );

        }

        // =================================================
        // BENVENUTO DM
        // =================================================

        try {

            const avatar =
                member.user.displayAvatarURL({
                    extension: 'png',
                    size: 1024
                });

            const dmEmbed =
                new EmbedBuilder()
                    .setColor('#5865F2')
                    .setTitle(
                        `👋 Benvenuto su ${member.guild.name}!`
                    )
                    .setDescription(
                        `Ciao ${member.user}!\n\n` +
                        `Siamo felici che tu abbia deciso di unirti alla nostra community. ❤️\n\n` +
                        `Prima di iniziare ti consigliamo di dare un'occhiata al regolamento e alle informazioni principali del server.\n\n` +
                        `🎫 Se hai bisogno di assistenza, utilizza il nostro sistema ticket.\n\n` +
                        `🛡️ Ricordati inoltre di completare la verifica.`
                    )
                    .setThumbnail(avatar)
                    .setFooter({
                        text:
                            'Grazie per esserti unito a noi!'
                    })
                    .setTimestamp();

            await member.send({
                embeds: [
                    dmEmbed
                ]
            });

        } catch (error) {

            console.log(
                `⚠️ DM non inviabile a ${member.user.tag}.`
            );

        }

        // =================================================
        // LOG INGRESSO
        // =================================================

        const logEmbed =
            new EmbedBuilder()
                .setColor('#00FF88')
                .setTitle(
                    '📥 Nuovo membro'
                )
                .setDescription(
                    `👤 **Utente:** ${member.user}\n` +
                    `🏷️ **Username:** ${member.user.tag}\n` +
                    `🆔 **ID:** \`${member.id}\`\n` +
                    `📊 **Membri server:** ${member.guild.memberCount}`
                )
                .setThumbnail(
                    member.user.displayAvatarURL({
                        extension: 'png'
                    })
                )
                .setTimestamp();

        await sendLog(
            LOG_CHANNEL_ID,
            logEmbed
        );

    }
);

// =====================================================
// SISTEMA TICKET - CATEGORIE
// =====================================================

const ticketTypes = {

    assistenza: {
        label: 'Assistenza Generale',
        emoji: '🔧',
        description: 'Problemi, dubbi o richieste generali.',
        audienceLabel: 'Staff',
        roleId: STAFF_ROLE_ID
    },

    gestionali: {
        label: 'Contatto team gestionale',
        emoji: '👑',
        description: 'Contatta esclusivamente il team gestionale.',
        audienceLabel: 'team gestionale',
        roleId: GESTIONALE_ROLE_ID
    },

    amministrazione: {
        label: 'Amministrazione',
        emoji: '🛡️',
        description: 'Richieste rivolte all’amministrazione.',
        audienceLabel: 'Amministrazione',
        roleId: ADMIN_ROLE_ID
    },

    partnership: {
        label: 'Partnership',
        emoji: '🤝',
        description: 'Richieste e proposte di partnership.',
        audienceLabel: 'Staff',
        roleId: STAFF_ROLE_ID
    }

};

const factionTicketTypes = {

    fdo: {
        label: 'Supporto FDO',
        emoji: '🚓',
        description: 'Richieste per la Forza dell’Ordine.',
        audienceLabel: 'Addetti FDO',
        roleId: FDO_ROLE_ID
    },

    sanitari: {
        label: 'Supporto Sanitari',
        emoji: '🚑',
        description: 'Richieste per il personale sanitario.',
        audienceLabel: 'Addetti Sanitari',
        roleId: SANITARI_ROLE_ID
    },

    antincendio: {
        label: 'Supporto Anti-incendio',
        emoji: '🚒',
        description: 'Richieste per il corpo anti-incendio.',
        audienceLabel: 'Addetti Anti-incendio',
        roleId: ANTINCENDIO_ROLE_ID
    },

    stradale: {
        label: 'Supporto Stradale',
        emoji: '🚧',
        description: 'Richieste per il servizio stradale.',
        audienceLabel: 'Addetti Stradali',
        roleId: STRADALE_ROLE_ID
    }

};

function getTicketConfiguration(type) {

    if (type.startsWith('fazione_')) {

        return {
            ticket: factionTicketTypes[type.replace('fazione_', '')],
            isFaction: true,
            openCategoryId: FAZIONI_OPEN_CATEGORY_ID,
            claimedCategoryId: FAZIONI_CLAIMED_CATEGORY_ID
        };

    }

    return {
        ticket: ticketTypes[type],
        isFaction: false,
        openCategoryId: TICKET_CATEGORY_ID,
        claimedCategoryId: CLAIMED_TICKET_CATEGORY_ID
    };

}

// =====================================================
// PANNELLO TICKET
// =====================================================

async function sendTicketPanel() {

    try {

        if (!TICKET_PANEL_CHANNEL_ID) return;

        const channel =
            await client.channels.fetch(
                TICKET_PANEL_CHANNEL_ID
            );

        if (!channel) return;

        const embed =
            new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🎫 CENTRO ASSISTENZA')
                .setDescription(
                    'Benvenuto nel nostro centro assistenza!\n\n' +
                    'Seleziona dal menu la categoria più adatta alla tua richiesta.\n\n' +
                    '🔧 **Assistenza Generale**\n' +
                    'Problemi, dubbi o richieste generali.\n\n' +
                    '👑 **Contatto del team gestionale**\n' +
                    'Contatta il team gestionale per richieste organizzative.\n\n' +
                    '🛡️ **Amministrazione**\n' +
                    'Richieste rivolte all’amministrazione.\n\n' +
                    '🤝 **Partnership**\n' +
                    'Proposte e richieste di collaborazione.\n\n' +
                    '⚠️ Apri un solo ticket per la stessa richiesta.'
                )
                .setFooter({
                    text:
                        `${client.user.username} • Sistema Ticket`
                })
                .setTimestamp();

        const menu =
            new StringSelectMenuBuilder()
                .setCustomId(
                    'ticket_category_select'
                )
                .setPlaceholder(
                    '🎫 Seleziona il tipo di ticket'
                )
                .addOptions(
                    Object.entries(
                        ticketTypes
                    ).map(
                        ([value, ticket]) => ({
                            label: ticket.label,
                            description: ticket.description,
                            value,
                            emoji: ticket.emoji
                        })
                    )
                );

        const row =
            new ActionRowBuilder()
                .addComponents(
                    menu
                );

        await channel.send({
            embeds: [
                embed
            ],
            components: [
                row
            ]
        });

        console.log(
            '✅ Pannello ticket inviato.'
        );

    } catch (error) {

        console.error(
            '❌ Errore pannello ticket:',
            error
        );

    }

}

// =====================================================
// COMANDO PANNELLO TICKET
// =====================================================

const ticketPanelCommand =
    new SlashCommandBuilder()
        .setName('pannello-ticket')
        .setDescription(
            'Invia il pannello del sistema ticket'
        );

// Aggiunge il comando alla lista senza duplicarlo
if (
    !commands.some(
        command =>
            command.name === 'pannello-ticket'
    )
) {

    commands.push(
        ticketPanelCommand
    );

}

// =====================================================
// INTERAZIONE - APERTURA TICKET
// =====================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isStringSelectMenu()) return;

        if (
            interaction.customId !== 'ticket_category_select' &&
            interaction.customId !== 'fazioni_category_select'
        ) return;

        const type =
            interaction.values[0];

        const ticketType =
            interaction.customId === 'fazioni_category_select'
                ? `fazione_${type}`
                : type;

        const ticketConfiguration =
            getTicketConfiguration(ticketType);

        const ticket =
            ticketConfiguration.ticket;

        if (!ticket) {

            return interaction.reply({
                content:
                    '❌ Categoria ticket non valida.',
                ephemeral: true
            });

        }

        if (!ticketConfiguration.openCategoryId) {

            return interaction.reply({
                content:
                    '❌ La categoria dei ticket non è configurata nel file .env.',
                ephemeral: true
            });

        }

        if (
            ticketConfiguration.isFaction &&
            !ticket.roleId
        ) {

            return interaction.reply({
                content:
                    '❌ Il ruolo degli addetti a questa fazione non è configurato nel file .env.',
                ephemeral: true
            });

        }

        await interaction.deferReply({
            ephemeral: true
        });

        // =================================================
        // CONTROLLO TICKET ESISTENTE
        // =================================================

        db.get(
            `
            SELECT *
            FROM tickets
            WHERE userId = ?
            AND status != 'closed'
            AND type ${ticketConfiguration.isFaction ? 'LIKE' : 'NOT LIKE'} 'fazione_%'
            `,
            [
                interaction.user.id
            ],
            async (
                error,
                existingTicket
            ) => {

                if (error) {

                    console.error(
                        '❌ Errore database ticket:',
                        error
                    );

                    return interaction.editReply({
                        content:
                            '❌ Errore durante il controllo del ticket.',
                        ephemeral: true
                    });

                }

                if (existingTicket) {

                    return interaction.editReply({
                        content:
                            `❌ Hai già un ticket aperto: <#${existingTicket.channelId}>`,
                        ephemeral: true
                    });

                }

                let ticketNumber;

                try {

                    ticketNumber = await getNextTicketNumber();

                } catch (error) {

                    console.error(
                        '❌ Errore contatore ticket:',
                        error
                    );

                    return interaction.editReply({
                        content:
                            '❌ Non è stato possibile assegnare il numero al ticket.',
                        ephemeral: true
                    });

                }

                // =================================================
                // NOME CANALE
                // =================================================

                const username =
                    interaction.user.username
                        .toLowerCase()
                        .replace(
                            /[^a-z0-9]/g,
                            ''
                        )
                        .slice(
                            0,
                            15
                        );

                const channelName =
                    `ticket-${username}_${ticketNumber}`;

                // =================================================
                // PERMESSI BASE
                // =================================================

                const permissionOverwrites = [

                    {
                        id:
                            interaction.guild.roles.everyone.id,

                        deny: [
                            PermissionsBitField.Flags.ViewChannel
                        ]
                    },

                    {
                        id:
                            interaction.user.id,

                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory,
                            PermissionsBitField.Flags.AttachFiles
                        ]
                    }

                ];

                // =================================================
                // PERMESSI IN BASE ALLA CATEGORIA
                // =================================================

                if (ticket.roleId) {

                    permissionOverwrites.push({
                        id: ticket.roleId,

                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory,
                            PermissionsBitField.Flags.AttachFiles
                        ]
                    });

                }

                // Gli amministratori vedono tutti i ticket
                if (
                    ADMIN_ROLE_ID &&
                    ticket.roleId !== ADMIN_ROLE_ID
                ) {

                    permissionOverwrites.push({
                        id: ADMIN_ROLE_ID,

                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory,
                            PermissionsBitField.Flags.AttachFiles
                        ]
                    });

                }

                // =================================================
                // CREAZIONE CANALE
                // =================================================

                let ticketChannel;

                try {

                    ticketChannel =
                        await interaction.guild.channels.create({
                            name: channelName,
                            type: ChannelType.GuildText,
                            parent:
                                ticketConfiguration.openCategoryId,
                            permissionOverwrites
                        });

                } catch (error) {

                    console.error(
                        '❌ Errore creazione ticket:',
                        error
                    );

                    return interaction.editReply({
                        content:
                            '❌ Non è stato possibile creare il ticket. Controlla i permessi del bot.',
                        ephemeral: true
                    });

                }

                // =================================================
                // DATABASE
                // =================================================

                db.run(
                    `
                    INSERT INTO tickets
                    (
                        channelId,
                        userId,
                        type,
                        status,
                        createdAt,
                        ticketNumber
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                    `,
                    [
                        ticketChannel.id,
                        interaction.user.id,
                        ticketType,
                        'open',
                        Date.now(),
                        ticketNumber
                    ]
                );

                // =================================================
                // EMBED TICKET
                // =================================================

                const ticketDescription =
                    ticketConfiguration.isFaction
                        ? `Ciao ${interaction.user}!\n\n` +
                            `Grazie per aver contattato il reparto **${ticket.label}**.\n\n` +
                            `📝 **Descrivi la tua richiesta nel dettaglio.**\n` +
                            `Indica tutte le informazioni utili per permettere agli addetti di aiutarti rapidamente.\n\n` +
                            `📌 Un membro di **${ticket.audienceLabel}** prenderà in carico la richiesta.\n\n` +
                            `⚠️ Evita di aprire più ticket per la stessa richiesta.`
                        : `Ciao ${interaction.user}!\n\n` +
                            `Grazie per aver contattato il team **${ticket.audienceLabel}**.\n\n` +
                            `📝 **Descrivi la tua richiesta nel dettaglio.**\n` +
                            `Fornisci tutte le informazioni necessarie per permettere agli addetti di aiutarti rapidamente.\n\n` +
                            `📌 Un membro di **${ticket.audienceLabel}** prenderà in carico la richiesta.\n\n` +
                            `⚠️ Evita di aprire più ticket per la stessa richiesta.`;

                const ticketEmbed =
                    new EmbedBuilder()
                        .setColor(
                            ticketConfiguration.isFaction
                                ? '#F39C12'
                                : '#5865F2'
                        )
                        .setTitle(
                            `${ticket.emoji} ${ticket.label}`
                        )
                        .setDescription(
                            ticketDescription
                        )
                        .addFields(
                            {
                                name: '📂 Categoria',
                                value:
                                    ticket.label,
                                inline: true
                            },
                            {
                                name: '👤 Aperto da',
                                value:
                                    `${interaction.user}`,
                                inline: true
                            }
                        )
                        .setFooter({
                            text:
                                ticketConfiguration.isFaction
                                    ? 'Sistema Fazioni • In attesa degli addetti'
                                    : 'Sistema Ticket • In attesa di assistenza'
                        })
                        .setTimestamp();

                // =================================================
                // PULSANTI
                // =================================================

                const claimButton =
                    new ButtonBuilder()
                        .setCustomId(
                            'ticket_claim'
                        )
                        .setLabel(
                            'Reclama Ticket'
                        )
                        .setEmoji('📌')
                        .setStyle(
                            ButtonStyle.Primary
                        );

                const closeButton =
                    new ButtonBuilder()
                        .setCustomId(
                            'ticket_close'
                        )
                        .setLabel(
                            'Chiudi Ticket'
                        )
                        .setEmoji('🔒')
                        .setStyle(
                            ButtonStyle.Danger
                        );

                const row =
                    new ActionRowBuilder()
                        .addComponents(
                            claimButton,
                            closeButton
                        );

                // =================================================
                // PING DEL GRUPPO AUTORIZZATO
                // =================================================

                let rolePing = '';

                if (ticket.roleId) {

                    rolePing =
                        `<@&${ticket.roleId}>`;

                }

                await ticketChannel.send({
                    content:
                        `${interaction.user} ${rolePing}`.trim(),
                    embeds: [
                        ticketEmbed
                    ],
                    components: [
                        row
                    ],
                    allowedMentions: {
                        users: [interaction.user.id],
                        roles: ticket.roleId
                            ? [ticket.roleId]
                            : []
                    }
                });

                // =================================================
                // LOG APERTURA
                // =================================================

                const logEmbed =
                    new EmbedBuilder()
                        .setColor('#00FF88')
                        .setTitle(
                            '🎫 Ticket Aperto'
                        )
                        .setDescription(
                            `👤 **Utente:** ${interaction.user}\n` +
                            `📂 **Categoria:** ${ticket.label}\n` +
                            `📌 **Ticket:** ${ticketChannel}\n` +
                            `🆔 **ID:** \`${ticketChannel.id}\``
                        )
                        .setTimestamp();

                await sendLog(
                    LOG_CHANNEL_ID,
                    logEmbed
                );

                // =================================================
                // RISPOSTA
                // =================================================

                return interaction.editReply({
                    content:
                        `✅ Ticket creato: ${ticketChannel}`,
                    ephemeral: true
                });

            }
        );

    }
);

// =====================================================
// TICKET - RECLAMA / RILASCIA
// =====================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isButton()) return;

        if (
            interaction.customId !== 'ticket_claim' &&
            interaction.customId !== 'ticket_release'
        ) return;

        db.get(
            `
            SELECT *
            FROM tickets
            WHERE channelId = ?
            `,
            [interaction.channel.id],
            async (error, ticket) => {

                if (error) {

                    console.error(
                        '❌ Errore database ticket:',
                        error
                    );

                    return interaction.reply({
                        content:
                            '❌ Errore database.',
                        ephemeral: true
                    });

                }

                if (!ticket) {

                    return interaction.reply({
                        content:
                            '❌ Questo canale non è un ticket.',
                        ephemeral: true
                    });

                }

                const ticketConfiguration =
                    getTicketConfiguration(ticket.type);

                const ticketRoleId =
                    ticketConfiguration.ticket?.roleId;

                const isStaff =
                    ticketRoleId &&
                    interaction.member.roles.cache.has(
                        ticketRoleId
                    );

                const isAdmin =
                    ADMIN_ROLE_ID &&
                    interaction.member.roles.cache.has(
                        ADMIN_ROLE_ID
                    );

                const isGestionale =
                    GESTIONALE_ROLE_ID &&
                    interaction.member.roles.cache.has(
                        GESTIONALE_ROLE_ID
                    );

                if (
                    !isStaff &&
                    !isAdmin &&
                    !isGestionale
                ) {

                    return interaction.reply({
                        content:
                            '❌ Non hai il permesso di utilizzare questa funzione.',
                        ephemeral: true
                    });

                }

                // =================================================
                // RECLAMA
                // =================================================

                if (
                    interaction.customId ===
                    'ticket_claim'
                ) {

                    if (ticket.claimedBy) {

                        return interaction.reply({
                            content:
                                `❌ Ticket già reclamato da <@${ticket.claimedBy}>.`,
                            ephemeral: true
                        });

                    }

                    db.run(
                        `
                        UPDATE tickets
                        SET
                            status = ?,
                            claimedBy = ?,
                            claimedAt = ?
                        WHERE channelId = ?
                        `,
                        [
                            'claimed',
                            interaction.user.id,
                            Date.now(),
                            interaction.channel.id
                        ]
                    );

                    // =================================================
                    // CAMBIO CATEGORIA
                    // =================================================

                    try {

                        if (ticketConfiguration.claimedCategoryId) {

                            await interaction.channel.setParent(
                                ticketConfiguration.claimedCategoryId,
                                {
                                    lockPermissions: false
                                }
                            );

                        }

                    } catch (error) {

                        console.error(
                            '❌ Errore categoria ticket reclamato:',
                            error
                        );

                    }

                    // =================================================
                    // PERMESSI
                    // =================================================

                    try {

                        if (ticketRoleId) {

                            await interaction.channel.permissionOverwrites.edit(
                                ticketRoleId,
                                {
                                    ViewChannel: false,
                                    SendMessages: false,
                                    ReadMessageHistory: false
                                }
                            );

                        }

                        await interaction.channel.permissionOverwrites.edit(
                            ticket.userId,
                            {
                                ViewChannel: true,
                                SendMessages: true,
                                ReadMessageHistory: true
                            }
                        );

                        await interaction.channel.permissionOverwrites.edit(
                            interaction.user.id,
                            {
                                ViewChannel: true,
                                SendMessages: true,
                                ReadMessageHistory: true
                            }
                        );

                        if (ADMIN_ROLE_ID) {

                            await interaction.channel.permissionOverwrites.edit(
                                ADMIN_ROLE_ID,
                                {
                                    ViewChannel: true,
                                    SendMessages: true,
                                    ReadMessageHistory: true
                                }
                            );

                        }

                        if (GESTIONALE_ROLE_ID) {

                            await interaction.channel.permissionOverwrites.edit(
                                GESTIONALE_ROLE_ID,
                                {
                                    ViewChannel: true,
                                    SendMessages: true,
                                    ReadMessageHistory: true
                                }
                            );

                        }

                    } catch (error) {

                        console.error(
                            '❌ Errore permessi ticket:',
                            error
                        );

                    }

                    // =================================================
                    // MESSAGGIO
                    // =================================================

                    const embed =
                        new EmbedBuilder()
                            .setColor(
                                ticketConfiguration.isFaction
                                    ? '#F39C12'
                                    : '#5865F2'
                            )
                            .setTitle(
                                '📌 Ticket Reclamato'
                            )
                            .setDescription(
                                `Il ticket è stato preso in carico da ${interaction.user}.\n\n` +
                                `👤 **Utente:** <@${ticket.userId}>\n` +
                                (ticketConfiguration.isFaction
                                    ? `🛡️ **Addetto ${ticketConfiguration.ticket.label}:** ${interaction.user}\n\n` +
                                        `Il ticket è ora gestito dall'addetto della fazione incaricato.`
                                    : `👮 **Staff:** ${interaction.user}\n\n` +
                                        `Il ticket è ora gestito dallo staff incaricato.`)
                            )
                            .setTimestamp();

                    await interaction.channel.send({
                        embeds: [
                            embed
                        ]
                    });

                    // =================================================
                    // LOG
                    // =================================================

                    const logEmbed =
                        new EmbedBuilder()
                            .setColor(
                                ticketConfiguration.isFaction
                                    ? '#F39C12'
                                    : '#5865F2'
                            )
                            .setTitle(
                                '📌 Ticket Reclamato'
                            )
                            .setDescription(
                                `🎫 **Ticket:** ${interaction.channel}\n` +
                                `👤 **Utente:** <@${ticket.userId}>\n` +
                                `${ticketConfiguration.isFaction
                                    ? `🛡️ **Addetto:** ${interaction.user}\n`
                                    : `👮 **Staff:** ${interaction.user}\n`}` +
                                `🆔 **Staff ID:** \`${interaction.user.id}\``
                            )
                            .setTimestamp();

                    await sendLog(
                        LOG_CHANNEL_ID,
                        logEmbed
                    );

                    return interaction.reply({
                        content:
                            '✅ Hai reclamato il ticket.',
                        ephemeral: true
                    });

                }

                // =================================================
                // RILASCIA
                // =================================================

                if (
                    interaction.customId ===
                    'ticket_release'
                ) {

                    if (
                        ticket.claimedBy !==
                        interaction.user.id
                    ) {

                        return interaction.reply({
                            content:
                                '❌ Solo chi ha reclamato il ticket può rilasciarlo.',
                            ephemeral: true
                        });

                    }

                    db.run(
                        `
                        UPDATE tickets
                        SET
                            status = ?,
                            claimedBy = NULL,
                            claimedAt = NULL
                        WHERE channelId = ?
                        `,
                        [
                            'open',
                            interaction.channel.id
                        ]
                    );

                    try {

                        if (ticketConfiguration.openCategoryId) {

                            await interaction.channel.setParent(
                                ticketConfiguration.openCategoryId,
                                {
                                    lockPermissions: false
                                }
                            );

                        }

                        if (ticketRoleId) {

                            await interaction.channel.permissionOverwrites.edit(
                                ticketRoleId,
                                {
                                    ViewChannel: true,
                                    SendMessages: true,
                                    ReadMessageHistory: true
                                }
                            );

                        }

                        await interaction.channel.permissionOverwrites.delete(
                            interaction.user.id
                        );

                    } catch (error) {

                        console.error(
                            '❌ Errore ripristino ticket:',
                            error
                        );

                    }

                    const embed =
                        new EmbedBuilder()
                            .setColor('#FFA500')
                            .setTitle(
                                '🔓 Ticket Rilasciato'
                            )
                            .setDescription(
                                `${interaction.user} ha rilasciato il ticket.\n\n` +
                                `Il ticket è nuovamente disponibile per lo staff.`
                            )
                            .setTimestamp();

                    await interaction.channel.send({
                        embeds: [
                            embed
                        ]
                    });

                    const logEmbed =
                        new EmbedBuilder()
                            .setColor('#FFA500')
                            .setTitle(
                                '🔓 Ticket Rilasciato'
                            )
                            .setDescription(
                                `🎫 **Ticket:** ${interaction.channel}\n` +
                                `👤 **Utente:** <@${ticket.userId}>\n` +
                                `👮 **Staff:** ${interaction.user}`
                            )
                            .setTimestamp();

                    await sendLog(
                        LOG_CHANNEL_ID,
                        logEmbed
                    );

                    return interaction.reply({
                        content:
                            '✅ Hai rilasciato il ticket.',
                        ephemeral: true
                    });

                }

            }
        );

    }
);

// =====================================================
// TICKET - CHIUSURA
// =====================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isButton()) return;

        if (
            interaction.customId !== 'ticket_close'
        ) return;

        db.get(
            `
            SELECT *
            FROM tickets
            WHERE channelId = ?
            `,
            [interaction.channel.id],
            async (error, ticket) => {

                if (error) {

                    console.error(
                        '❌ Errore database chiusura:',
                        error
                    );

                    return interaction.reply({
                        content:
                            '❌ Errore durante la lettura del ticket.',
                        ephemeral: true
                    });

                }

                if (!ticket) {

                    return interaction.reply({
                        content:
                            '❌ Questo canale non è un ticket.',
                        ephemeral: true
                    });

                }

                const ticketRoleId =
                    getTicketConfiguration(ticket.type).ticket?.roleId;

                const isStaff =
                    ticketRoleId &&
                    interaction.member.roles.cache.has(
                        ticketRoleId
                    );

                const isAdmin =
                    ADMIN_ROLE_ID &&
                    interaction.member.roles.cache.has(
                        ADMIN_ROLE_ID
                    );

                const isGestionale =
                    GESTIONALE_ROLE_ID &&
                    interaction.member.roles.cache.has(
                        GESTIONALE_ROLE_ID
                    );

                if (
                    !isStaff &&
                    !isAdmin &&
                    !isGestionale
                ) {

                    return interaction.reply({
                        content:
                            '❌ Solo lo staff autorizzato può chiudere il ticket.',
                        ephemeral: true
                    });

                }

                if (
                    ticket.status === 'claimed' &&
                    ticket.claimedBy !==
                    interaction.user.id &&
                    !isAdmin &&
                    !isGestionale
                ) {

                    return interaction.reply({
                        content:
                            '❌ Questo ticket è stato reclamato da un altro membro dello staff.',
                        ephemeral: true
                    });

                }

                // =================================================
                // MODAL MOTIVO
                // =================================================

                const modal =
                    new ModalBuilder()
                        .setCustomId(
                            'ticket_close_modal'
                        )
                        .setTitle(
                            '🔒 Chiudi Ticket'
                        );

                const reasonInput =
                    new TextInputBuilder()
                        .setCustomId(
                            'close_reason'
                        )
                        .setLabel(
                            'Motivo della chiusura'
                        )
                        .setPlaceholder(
                            'Inserisci il motivo della chiusura...'
                        )
                        .setStyle(
                            TextInputStyle.Paragraph
                        )
                        .setRequired(true)
                        .setMinLength(3)
                        .setMaxLength(1000);

                modal.addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            reasonInput
                        )
                );

                await interaction.showModal(
                    modal
                );

            }
        );

    }
);

// =====================================================
// MODAL - CHIUSURA TICKET
// =====================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isModalSubmit()) return;

        if (
            interaction.customId !==
            'ticket_close_modal'
        ) return;

        const reason =
            interaction.fields.getTextInputValue(
                'close_reason'
            );

        db.get(
            `
            SELECT *
            FROM tickets
            WHERE channelId = ?
            `,
            [interaction.channel.id],
            async (error, ticket) => {

                if (error) {

                    console.error(
                        '❌ Errore database chiusura:',
                        error
                    );

                    return interaction.reply({
                        content:
                            '❌ Errore durante la chiusura.',
                        ephemeral: true
                    });

                }

                if (!ticket) {

                    return interaction.reply({
                        content:
                            '❌ Questo canale non è un ticket.',
                        ephemeral: true
                    });

                }

                const ticketRoleId =
                    getTicketConfiguration(ticket.type).ticket?.roleId;

                const isStaff =
                    ticketRoleId &&
                    interaction.member.roles.cache.has(
                        ticketRoleId
                    );

                const isAdmin =
                    ADMIN_ROLE_ID &&
                    interaction.member.roles.cache.has(
                        ADMIN_ROLE_ID
                    );

                const isGestionale =
                    GESTIONALE_ROLE_ID &&
                    interaction.member.roles.cache.has(
                        GESTIONALE_ROLE_ID
                    );

                if (
                    !isStaff &&
                    !isAdmin &&
                    !isGestionale
                ) {

                    return interaction.reply({
                        content:
                            '❌ Non hai il permesso di chiudere questo ticket.',
                        ephemeral: true
                    });

                }

                if (
                    ticket.status === 'claimed' &&
                    ticket.claimedBy !==
                    interaction.user.id &&
                    !isAdmin &&
                    !isGestionale
                ) {

                    return interaction.reply({
                        content:
                            '❌ Solo chi ha reclamato questo ticket può chiuderlo.',
                        ephemeral: true
                    });

                }

                // =================================================
                // DATABASE
                // =================================================

                db.run(
                    `
                    UPDATE tickets
                    SET
                        status = ?,
                        closedAt = ?,
                        closedBy = ?,
                        closeReason = ?
                    WHERE channelId = ?
                    `,
                    [
                        'closed',
                        Date.now(),
                        interaction.user.id,
                        reason,
                        interaction.channel.id
                    ]
                );

                // =================================================
                // DM UTENTE
                // =================================================

                try {

                    const user =
                        await client.users.fetch(
                            ticket.userId
                        );

                    const dmEmbed =
                        new EmbedBuilder()
                            .setColor('#ED4245')
                            .setTitle(
                                '🔒 Il tuo ticket è stato chiuso'
                            )
                            .setDescription(
                                `Il ticket sul server **${interaction.guild.name}** è stato chiuso dallo staff.`
                            )
                            .addFields(
                                {
                                    name: '👮 Chiuso da',
                                    value:
                                        `${interaction.user}`,
                                    inline: true
                                },
                                {
                                    name: '📝 Motivo',
                                    value:
                                        reason,
                                    inline: false
                                }
                            )
                            .setFooter({
                                text:
                                    'Sistema Ticket'
                            })
                            .setTimestamp();

                    await user.send({
                        embeds: [
                            dmEmbed
                        ]
                    });

                } catch (error) {

                    console.log(
                        `⚠️ DM non inviabile a ${ticket.userId}.`
                    );

                }

                // =================================================
                // LOG PRIVATO
                // =================================================

                const logEmbed =
                    new EmbedBuilder()
                        .setColor('#ED4245')
                        .setTitle(
                            '🔒 Ticket Chiuso'
                        )
                        .setDescription(
                            `🎫 **Canale:** <#${interaction.channel.id}>\n` +
                            `👤 **Utente:** <@${ticket.userId}>\n` +
                            `👮 **Staff:** ${interaction.user}\n` +
                            `🆔 **Staff ID:** \`${interaction.user.id}\``
                        )
                        .addFields({
                            name: '📝 Motivo',
                            value:
                                reason
                        })
                        .setTimestamp();

                await sendLog(
                    LOG_CHANNEL_ID,
                    logEmbed
                );

                // =================================================
                // MESSAGGIO CHIUSURA
                // =================================================

                const closedEmbed =
                    new EmbedBuilder()
                        .setColor('#ED4245')
                        .setTitle(
                            '🔒 Ticket Chiuso'
                        )
                        .setDescription(
                            `Questo ticket è stato chiuso da ${interaction.user}.\n\n` +
                            `📝 **Motivo:**\n${reason}\n\n` +
                            `🗑️ Il canale verrà eliminato tra **10 secondi**.`
                        )
                        .setTimestamp();

                await interaction.reply({
                    embeds: [
                        closedEmbed
                    ]
                });

                // =================================================
                // ELIMINA CANALE
                // =================================================

                setTimeout(
                    async () => {

                        try {

                            await interaction.channel.delete(
                                'Ticket chiuso'
                            );

                        } catch (error) {

                            console.error(
                                '❌ Errore eliminazione ticket:',
                                error
                            );

                        }

                    },
                    10000
                );

            }
        );

    }
);

// =====================================================
// COMANDI DI MODERAZIONE
// =====================================================

function hasRole(member, roleId) {

    if (!member || !roleId) return false;

    return member.roles.cache.has(roleId);

}

function canModerate(member) {

    return (
        hasRole(member, STAFF_ROLE_ID) ||
        hasRole(member, MOD_ROLE_ID) ||
        hasRole(member, ADMIN_ROLE_ID)
    );

}

function canAdmin(member) {

    return hasRole(
        member,
        ADMIN_ROLE_ID
    );

}

// =====================================================
// INTERACTION - COMANDI SLASH
// =====================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isChatInputCommand()) return;

        const command =
            interaction.commandName;

        if (
            command === 'ticket-info' ||
            command === 'rilascia' ||
            command === 'chiudi'
        ) {

            const ticket = await new Promise(resolve => {

                db.get(
                    `SELECT * FROM tickets WHERE channelId = ?`,
                    [interaction.channel.id],
                    (error, row) => resolve(error ? null : row)
                );

            });

            if (!ticket) {

                return interaction.reply({
                    content: '❌ Questo canale non è un ticket.',
                    ephemeral: true
                });

            }

            const staffMember = interaction.member;
            const canUseTicket =
                canModerate(staffMember) ||
                isGestionale(staffMember);

            if (!canUseTicket) {

                return interaction.reply({
                    content: '❌ Non hai il permesso di utilizzare questo comando.',
                    ephemeral: true
                });

            }

            if (command === 'ticket-info') {

                const status =
                    ticket.status === 'claimed'
                        ? `Reclamato da <@${ticket.claimedBy}>`
                        : ticket.status === 'closed'
                            ? 'Chiuso'
                            : 'Aperto';

                const embed =
                    new EmbedBuilder()
                        .setColor('#5865F2')
                        .setTitle('🎫 Informazioni ticket')
                        .addFields(
                            {
                                name: '📂 Categoria',
                                value: getTicketConfiguration(ticket.type).ticket?.label || ticket.type,
                                inline: true
                            },
                            {
                                name: '📌 Stato',
                                value: status,
                                inline: true
                            },
                            {
                                name: '👤 Aperto da',
                                value: `<@${ticket.userId}>`,
                                inline: true
                            },
                            {
                                name: '🕒 Creato',
                                value: `<t:${Math.floor(ticket.createdAt / 1000)}:F>`,
                                inline: false
                            }
                        )
                        .setTimestamp();

                return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                });

            }

            if (command === 'chiudi') {

                if (ticket.status === 'closed') {

                    return interaction.reply({
                        content: '❌ Questo ticket è già chiuso.',
                        ephemeral: true
                    });

                }

                const modal =
                    new ModalBuilder()
                        .setCustomId('ticket_close_modal')
                        .setTitle('🔒 Chiudi ticket');

                const reasonInput =
                    new TextInputBuilder()
                        .setCustomId('close_reason')
                        .setLabel('Motivo della chiusura')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                        .setMinLength(3)
                        .setMaxLength(1000);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(reasonInput)
                );

                return interaction.showModal(modal);

            }

            if (ticket.status !== 'claimed') {

                return interaction.reply({
                    content: '❌ Questo ticket non è attualmente reclamato.',
                    ephemeral: true
                });

            }

            if (
                ticket.claimedBy !== interaction.user.id &&
                !canAdmin(staffMember)
            ) {

                return interaction.reply({
                    content: '❌ Solo chi ha reclamato il ticket o un amministratore può rilasciarlo.',
                    ephemeral: true
                });

            }

            const updated = await new Promise(resolve => {

                db.run(
                    `UPDATE tickets SET status = 'open', claimedBy = NULL, claimedAt = NULL WHERE channelId = ? AND status = 'claimed'`,
                    [interaction.channel.id],
                    function (error) {
                        resolve(!error && this.changes === 1);
                    }
                );

            });

            if (!updated) {

                return interaction.reply({
                    content: '❌ Il ticket è stato modificato da un altro membro dello staff. Riprova.',
                    ephemeral: true
                });

            }

            try {

                if (TICKET_CATEGORY_ID) {

                    await interaction.channel.setParent(
                        TICKET_CATEGORY_ID,
                        { lockPermissions: false }
                    );

                }

                if (STAFF_ROLE_ID) {

                    await interaction.channel.permissionOverwrites.edit(
                        STAFF_ROLE_ID,
                        {
                            ViewChannel: true,
                            SendMessages: true,
                            ReadMessageHistory: true
                        }
                    );

                }

                await interaction.channel.permissionOverwrites.delete(
                    ticket.claimedBy
                );

            } catch (error) {

                console.error('❌ Errore ripristino ticket:', error);

            }

            await interaction.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FFA500')
                        .setTitle('🔓 Ticket rilasciato')
                        .setDescription(`${interaction.user} ha rilasciato il ticket.`)
                        .setTimestamp()
                ]
            });

            return interaction.reply({
                content: '✅ Ticket rilasciato correttamente.',
                ephemeral: true
            });

        }

        // =================================================
        // PING
        // =================================================

        if (command === 'ping') {

            const latency =
                Date.now() -
                interaction.createdTimestamp;

            return interaction.reply({
                content:
                    `🏓 Pong!\n\n` +
                    `⚡ Latenza: **${latency}ms**\n` +
                    `💓 WebSocket: **${client.ws.ping}ms**`,
                ephemeral: true
            });

        }

        // =================================================
        // AVATAR
        // =================================================

        if (command === 'avatar') {

            const user =
                interaction.options.getUser(
                    'utente'
                ) ||
                interaction.user;

            const avatar =
                user.displayAvatarURL({
                    extension: 'png',
                    size: 1024
                });

            const embed =
                new EmbedBuilder()
                    .setColor('#5865F2')
                    .setTitle(
                        `🖼️ Avatar di ${user.username}`
                    )
                    .setImage(avatar)
                    .setFooter({
                        text:
                            `Richiesto da ${interaction.user.username}`
                    })
                    .setTimestamp();

            return interaction.reply({
                embeds: [
                    embed
                ]
            });

        }

        // =================================================
        // USERINFO
        // =================================================

        if (command === 'userinfo') {

            const user =
                interaction.options.getUser(
                    'utente'
                ) ||
                interaction.user;

            const member =
                await interaction.guild.members.fetch(
                    user.id
                ).catch(
                    () => null
                );

            const embed =
                new EmbedBuilder()
                    .setColor('#5865F2')
                    .setTitle(
                        `👤 Informazioni utente`
                    )
                    .setThumbnail(
                        user.displayAvatarURL({
                            extension: 'png',
                            size: 512
                        })
                    )
                    .addFields(
                        {
                            name: '👤 Username',
                            value:
                                `${user}`,
                            inline: true
                        },
                        {
                            name: '🆔 ID',
                            value:
                                `\`${user.id}\``,
                            inline: true
                        },
                        {
                            name: '📅 Account creato',
                            value:
                                `<t:${Math.floor(
                                    user.createdTimestamp / 1000
                                )}:F>`,
                            inline: false
                        },
                        {
                            name: '📥 Entrato nel server',
                            value:
                                member
                                    ? `<t:${Math.floor(
                                        member.joinedTimestamp / 1000
                                    )}:F>`
                                    : 'N/D',
                            inline: false
                        }
                    )
                    .setTimestamp();

            return interaction.reply({
                embeds: [
                    embed
                ]
            });

        }

        // =================================================
        // SERVERINFO
        // =================================================

        if (command === 'serverinfo') {

            const guild =
                interaction.guild;

            const embed =
                new EmbedBuilder()
                    .setColor('#5865F2')
                    .setTitle(
                        `🌐 ${guild.name}`
                    )
                    .setThumbnail(
                        guild.iconURL({
                            extension: 'png',
                            size: 512
                        })
                    )
                    .addFields(
                        {
                            name: '👥 Membri',
                            value:
                                `${guild.memberCount}`,
                            inline: true
                        },
                        {
                            name: '💬 Canali',
                            value:
                                `${guild.channels.cache.size}`,
                            inline: true
                        },
                        {
                            name: '🎭 Ruoli',
                            value:
                                `${guild.roles.cache.size}`,
                            inline: true
                        },
                        {
                            name: '🆔 ID',
                            value:
                                `\`${guild.id}\``,
                            inline: false
                        },
                        {
                            name: '📅 Creazione',
                            value:
                                `<t:${Math.floor(
                                    guild.createdTimestamp / 1000
                                )}:F>`,
                            inline: false
                        }
                    )
                    .setTimestamp();

            return interaction.reply({
                embeds: [
                    embed
                ]
            });

        }

        // =================================================
        // AGGIUNGI UTENTE AL TICKET
        // =================================================

        if (command === 'aggiungi-utente') {

            if (!canModerate(interaction.member)) {

                return interaction.reply({
                    content:
                        '❌ Non hai il permesso di modificare questo ticket.',
                    ephemeral: true
                });

            }

            db.get(
                `
                SELECT *
                FROM tickets
                WHERE channelId = ?
                `,
                [
                    interaction.channel.id
                ],
                async (error, ticket) => {

                    if (error || !ticket) {

                        return interaction.reply({
                            content:
                                '❌ Questo canale non è un ticket.',
                            ephemeral: true
                        });

                    }

                    const user =
                        interaction.options.getUser(
                            'utente'
                        );

                    try {

                        await interaction.channel.permissionOverwrites.edit(
                            user.id,
                            {
                                ViewChannel: true,
                                SendMessages: true,
                                ReadMessageHistory: true,
                                AttachFiles: true
                            }
                        );

                        return interaction.reply({
                            content:
                                `✅ ${user} è stato aggiunto al ticket.`
                        });

                    } catch (error) {

                        console.error(error);

                        return interaction.reply({
                            content:
                                '❌ Non è stato possibile aggiungere l’utente.',
                            ephemeral: true
                        });

                    }

                }
            );

            return;

        }

        // =================================================
        // RIMUOVI UTENTE DAL TICKET
        // =================================================

        if (command === 'rimuovi-utente') {

            if (!canModerate(interaction.member)) {

                return interaction.reply({
                    content:
                        '❌ Non hai il permesso di modificare questo ticket.',
                    ephemeral: true
                });

            }

            const user =
                interaction.options.getUser(
                    'utente'
                );

            try {

                await interaction.channel.permissionOverwrites.delete(
                    user.id
                );

                return interaction.reply({
                    content:
                        `✅ ${user} è stato rimosso dal ticket.`
                });

            } catch (error) {

                console.error(error);

                return interaction.reply({
                    content:
                        '❌ Non è stato possibile rimuovere l’utente.',
                    ephemeral: true
                });

            }

        }

    // =====================================================
    // MODERAZIONE - RICHIAMO
    // =====================================================

if (command === 'richiamo') {

    if (!canModerate(interaction.member)) {

        return interaction.reply({
            content: '❌ Non hai il permesso di usare questo comando.',
            ephemeral: true
        });

    }

    const user =
        interaction.options.getUser('utente');

    const reason =
        interaction.options.getString('motivo');

    const target =
        await interaction.guild.members
            .fetch(user.id)
            .catch(() => null);

    if (!target) {

        return interaction.reply({
            content: '❌ Utente non trovato nel server.',
            ephemeral: true
        });

    }

    if (
        target.id === interaction.user.id
    ) {

        return interaction.reply({
            content: '❌ Non puoi richiamare te stesso.',
            ephemeral: true
        });

    }

    db.run(
        `
        INSERT INTO warnings
        (
            userId,
            guildId,
            moderatorId,
            reason,
            createdAt
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            user.id,
            interaction.guild.id,
            interaction.user.id,
            reason,
            Date.now()
        ]
    );

    // =================================================
    // DM
    // =================================================

    try {

        const dmEmbed =
            new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('⚠️ Hai ricevuto un richiamo')
                .setDescription(
                    `Hai ricevuto un richiamo nel server **${interaction.guild.name}**.`
                )
                .addFields(
                    {
                        name: '👮 Moderatore',
                        value: `${interaction.user}`,
                        inline: true
                    },
                    {
                        name: '📝 Motivo',
                        value: reason,
                        inline: false
                    }
                )
                .setFooter({
                    text: 'Sistema di moderazione'
                })
                .setTimestamp();

        await user.send({
            embeds: [dmEmbed]
        });

    } catch (error) {

        console.log(
            `⚠️ DM non inviabile a ${user.tag}.`
        );

    }

    // =================================================
    // LOG PRIVATO
    // =================================================

    const logEmbed =
        new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('⚠️ Richiamo assegnato')
            .setDescription(
                `👤 **Utente:** ${user}\n` +
                `🆔 **ID:** \`${user.id}\`\n` +
                `👮 **Moderatore:** ${interaction.user}\n` +
                `📝 **Motivo:** ${reason}`
            )
            .setTimestamp();

    await sendLog(
        MOD_LOG_CHANNEL_ID || LOG_CHANNEL_ID,
        logEmbed
    );

    // =================================================
    // SANZIONE PUBBLICA
    // =================================================

    await sendPublicSanction(
        '⚠️ Sanzione disciplinare',
        `👤 **Utente:** ${user}\n` +
        `📌 **Tipo:** Richiamo\n` +
        `📝 **Motivo:** ${reason}\n\n` +
        `La sanzione è stata registrata dal sistema di moderazione.`
    );

    return interaction.reply({
        content:
            `✅ ${user} ha ricevuto un richiamo.`,
        ephemeral: true
    });

}

// =====================================================
// VISUALIZZA RICHIAMI
// =====================================================

if (command === 'richiami') {

    if (!canModerate(interaction.member)) {

        return interaction.reply({
            content: '❌ Non hai il permesso.',
            ephemeral: true
        });

    }

    const user =
        interaction.options.getUser('utente');

    db.all(
        `
        SELECT *
        FROM warnings
        WHERE userId = ?
        AND guildId = ?
        ORDER BY createdAt DESC
        `,
        [
            user.id,
            interaction.guild.id
        ],
        async (error, rows) => {

            if (error) {

                console.error(error);

                return interaction.reply({
                    content: '❌ Errore database.',
                    ephemeral: true
                });

            }

            if (!rows.length) {

                return interaction.reply({
                    content:
                        `📋 ${user} non ha richiami registrati.`,
                    ephemeral: true
                });

            }

            const description =
                rows
                    .map(
                        (warning, index) =>
                            `**${index + 1}.** <t:${Math.floor(
                                warning.createdAt / 1000
                            )}:F>\n` +
                            `👮 <@${warning.moderatorId}>\n` +
                            `📝 ${warning.reason}`
                    )
                    .join('\n\n');

            const embed =
                new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle(
                        `⚠️ Richiami di ${user.username}`
                    )
                    .setThumbnail(
                        user.displayAvatarURL({
                            extension: 'png'
                        })
                    )
                    .setDescription(
                        description
                    )
                    .setFooter({
                        text:
                            `Totale richiami: ${rows.length}`
                    })
                    .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });

        }
    );

    return;

}

// =====================================================
// CANCELLA RICHIAMI
// =====================================================

if (command === 'cancellarichiami') {

    if (!canAdmin(interaction.member)) {

        return interaction.reply({
            content:
                '❌ Solo gli amministratori possono cancellare i richiami.',
            ephemeral: true
        });

    }

    const user =
        interaction.options.getUser('utente');

    db.run(
        `
        DELETE FROM warnings
        WHERE userId = ?
        AND guildId = ?
        `,
        [
            user.id,
            interaction.guild.id
        ],
        async error => {

            if (error) {

                console.error(error);

                return interaction.reply({
                    content:
                        '❌ Errore durante la cancellazione.',
                    ephemeral: true
                });

            }

            const embed =
                new EmbedBuilder()
                    .setColor('#00FF88')
                    .setTitle('🧹 Richiami cancellati')
                    .setDescription(
                        `Tutti i richiami di ${user} sono stati cancellati.`
                    )
                    .setTimestamp();

            await sendLog(
                MOD_LOG_CHANNEL_ID || LOG_CHANNEL_ID,
                embed
            );

            return interaction.reply({
                content:
                    `✅ Richiami di ${user} cancellati.`,
                ephemeral: true
            });

        }
    );

    return;

}

// =====================================================
// MODERAZIONE - TIMEOUT
// =====================================================

if (command === 'timeout') {

    if (!canModerate(interaction.member)) {

        return interaction.reply({
            content:
                '❌ Non hai il permesso di usare il timeout.',
            ephemeral: true
        });

    }

    const user =
        interaction.options.getUser('utente');

    const minutes =
        interaction.options.getInteger('minuti');

    const reason =
        interaction.options.getString('motivo');

    const target =
        await interaction.guild.members
            .fetch(user.id)
            .catch(() => null);

    if (!target) {

        return interaction.reply({
            content:
                '❌ Utente non trovato nel server.',
            ephemeral: true
        });

    }

    if (
        target.id === interaction.user.id
    ) {

        return interaction.reply({
            content:
                '❌ Non puoi mettere te stesso in timeout.',
            ephemeral: true
        });

    }

    if (
        !target.moderatable
    ) {

        return interaction.reply({
            content:
                '❌ Non posso applicare il timeout a questo utente. Controlla la posizione del ruolo del bot e i permessi.',
            ephemeral: true
        });

    }

    try {

        await target.timeout(
            minutes * 60 * 1000,
            reason
        );

    } catch (error) {

        console.error(
            '❌ Errore timeout:',
            error
        );

        return interaction.reply({
            content:
                '❌ Non sono riuscito ad applicare il timeout.',
            ephemeral: true
        });

    }

    // =================================================
    // DM TIMEOUT
    // =================================================

    try {

        const dmEmbed =
            new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle(
                    '⏱️ Hai ricevuto un timeout'
                )
                .setDescription(
                    `Sei stato messo in timeout nel server **${interaction.guild.name}**.`
                )
                .addFields(
                    {
                        name: '⏳ Durata',
                        value:
                            `**${minutes} minuti**`,
                        inline: true
                    },
                    {
                        name: '👮 Moderatore',
                        value:
                            `${interaction.user}`,
                        inline: true
                    },
                    {
                        name: '📝 Motivo',
                        value:
                            reason,
                        inline: false
                    }
                )
                .setFooter({
                    text:
                        'Sistema di moderazione'
                })
                .setTimestamp();

        await user.send({
            embeds: [
                dmEmbed
            ]
        });

    } catch (error) {

        console.log(
            `⚠️ DM non inviabile a ${user.tag}.`
        );

    }

    // =================================================
    // LOG PRIVATO
    // =================================================

    const logEmbed =
        new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle(
                '⏱️ Timeout applicato'
            )
            .setDescription(
                `👤 **Utente:** ${user}\n` +
                `🆔 **ID:** \`${user.id}\`\n` +
                `👮 **Moderatore:** ${interaction.user}\n` +
                `⏳ **Durata:** ${minutes} minuti\n` +
                `📝 **Motivo:** ${reason}`
            )
            .setTimestamp();

    await sendLog(
        MOD_LOG_CHANNEL_ID || LOG_CHANNEL_ID,
        logEmbed
    );

    // =================================================
    // SANZIONE PUBBLICA
    // =================================================

    await sendPublicSanction(
        '⏱️ Timeout applicato',
        `👤 **Utente:** ${user}\n` +
        `📌 **Tipo:** Timeout\n` +
        `⏳ **Durata:** ${minutes} minuti\n` +
        `📝 **Motivo:** ${reason}`
    );

    return interaction.reply({
        content:
            `✅ ${user} è stato messo in timeout per **${minutes} minuti**.`,
        ephemeral: true
    });

}

// =====================================================
// RIMOZIONE TIMEOUT
// =====================================================

if (command === 'untimeout') {

    if (!canModerate(interaction.member)) {

        return interaction.reply({
            content:
                '❌ Non hai il permesso di rimuovere un timeout.',
            ephemeral: true
        });

    }

    const user =
        interaction.options.getUser('utente');

    const target =
        await interaction.guild.members
            .fetch(user.id)
            .catch(() => null);

    if (!target) {

        return interaction.reply({
            content:
                '❌ Utente non trovato nel server.',
            ephemeral: true
        });

    }

    if (!target.moderatable) {

        return interaction.reply({
            content:
                '❌ Non posso modificare il timeout di questo utente.',
            ephemeral: true
        });

    }

    try {

        await target.timeout(
            null,
            `Timeout rimosso da ${interaction.user.tag}`
        );

    } catch (error) {

        console.error(
            '❌ Errore rimozione timeout:',
            error
        );

        return interaction.reply({
            content:
                '❌ Non sono riuscito a rimuovere il timeout.',
            ephemeral: true
        });

    }

    // =================================================
    // DM
    // =================================================

    try {

        const dmEmbed =
            new EmbedBuilder()
                .setColor('#00FF88')
                .setTitle(
                    '✅ Timeout rimosso'
                )
                .setDescription(
                    `Il tuo timeout nel server **${interaction.guild.name}** è stato rimosso.`
                )
                .addFields({
                    name: '👮 Rimosso da',
                    value:
                        `${interaction.user}`
                })
                .setTimestamp();

        await user.send({
            embeds: [
                dmEmbed
            ]
        });

    } catch (error) {

        console.log(
            `⚠️ DM non inviabile a ${user.tag}.`
        );

    }

    const logEmbed =
        new EmbedBuilder()
            .setColor('#00FF88')
            .setTitle(
                '✅ Timeout rimosso'
            )
            .setDescription(
                `👤 **Utente:** ${user}\n` +
                `👮 **Moderatore:** ${interaction.user}`
            )
            .setTimestamp();

    await sendLog(
        MOD_LOG_CHANNEL_ID || LOG_CHANNEL_ID,
        logEmbed
    );

    return interaction.reply({
        content:
            `✅ Timeout di ${user} rimosso.`,
        ephemeral: true
    });

}

// =====================================================
// MODERAZIONE - BAN
// =====================================================

if (command === 'ban') {

    if (!canAdmin(interaction.member)) {

        return interaction.reply({
            content:
                '❌ Solo gli amministratori possono utilizzare il ban.',
            ephemeral: true
        });

    }

    const user =
        interaction.options.getUser('utente');

    const reason =
        interaction.options.getString('motivo');

    const target =
        await interaction.guild.members
            .fetch(user.id)
            .catch(() => null);

    if (
        target &&
        !target.bannable
    ) {

        return interaction.reply({
            content:
                '❌ Non posso bannare questo utente. Controlla la posizione del ruolo del bot e i permessi.',
            ephemeral: true
        });

    }

    // =================================================
    // DM PRIMA DEL BAN
    // =================================================

    try {

        const dmEmbed =
            new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle(
                    '🔨 Sei stato bannato'
                )
                .setDescription(
                    `Sei stato bannato dal server **${interaction.guild.name}**.`
                )
                .addFields(
                    {
                        name: '👮 Amministratore',
                        value:
                            `${interaction.user}`,
                        inline: true
                    },
                    {
                        name: '📝 Motivo',
                        value:
                            reason,
                        inline: false
                    }
                )
                .setFooter({
                    text:
                        'Sistema di moderazione'
                })
                .setTimestamp();

        await user.send({
            embeds: [
                dmEmbed
            ]
        });

    } catch (error) {

        console.log(
            `⚠️ Impossibile inviare il DM a ${user.tag}.`
        );

    }

    // =================================================
    // BAN
    // =================================================

    try {

        await interaction.guild.members.ban(
            user.id,
            {
                reason
            }
        );

    } catch (error) {

        console.error(
            '❌ Errore ban:',
            error
        );

        return interaction.reply({
            content:
                '❌ Non sono riuscito a bannare l’utente.',
            ephemeral: true
        });

    }

    // =================================================
    // LOG PRIVATO
    // =================================================

    const logEmbed =
        new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle(
                '🔨 Utente Bannato'
            )
            .setDescription(
                `👤 **Utente:** ${user}\n` +
                `🆔 **ID:** \`${user.id}\`\n` +
                `👮 **Amministratore:** ${interaction.user}\n` +
                `📝 **Motivo:** ${reason}`
            )
            .setTimestamp();

    await sendLog(
        BAN_LOG_CHANNEL_ID ||
        MOD_LOG_CHANNEL_ID ||
        LOG_CHANNEL_ID,
        logEmbed
    );

    // =================================================
    // SANZIONE PUBBLICA
    // =================================================

    await sendPublicSanction(
        '🔨 Utente bannato',
        `👤 **Utente:** ${user}\n` +
        `📌 **Tipo:** Ban\n` +
        `📝 **Motivo:** ${reason}`
    );

    return interaction.reply({
        content:
            `✅ ${user.tag} è stato bannato.`,
        ephemeral: true
    });

}

// =====================================================
// UNBAN
// =====================================================

if (command === 'unban') {

    if (!canAdmin(interaction.member)) {

        return interaction.reply({
            content:
                '❌ Solo gli amministratori possono utilizzare l’unban.',
            ephemeral: true
        });

    }

    const userId =
        interaction.options.getString('utente');

    try {

        await interaction.guild.members.unban(
            userId,
            `Unban eseguito da ${interaction.user.tag}`
        );

    } catch (error) {

        console.error(
            '❌ Errore unban:',
            error
        );

        return interaction.reply({
            content:
                '❌ Impossibile rimuovere il ban. Controlla che l’ID sia corretto e che l’utente sia bannato.',
            ephemeral: true
        });

    }

    // =================================================
    // LOG
    // =================================================

    const logEmbed =
        new EmbedBuilder()
            .setColor('#00FF88')
            .setTitle(
                '✅ Ban rimosso'
            )
            .setDescription(
                `🆔 **Utente ID:** \`${userId}\`\n` +
                `👮 **Amministratore:** ${interaction.user}`
            )
            .setTimestamp();

    await sendLog(
        BAN_LOG_CHANNEL_ID ||
        MOD_LOG_CHANNEL_ID ||
        LOG_CHANNEL_ID,
        logEmbed
    );

    return interaction.reply({
        content:
            `✅ Ban rimosso per l'utente \`${userId}\`.`,
        ephemeral: true
    });

}

// =====================================================
// KICK
// =====================================================

if (command === 'kick') {

    if (!canModerate(interaction.member)) {

        return interaction.reply({
            content:
                '❌ Non hai il permesso di utilizzare il kick.',
            ephemeral: true
        });

    }

    const user =
        interaction.options.getUser('utente');

    const reason =
        interaction.options.getString('motivo');

    const target =
        await interaction.guild.members
            .fetch(user.id)
            .catch(() => null);

    if (!target) {

        return interaction.reply({
            content:
                '❌ Utente non trovato nel server.',
            ephemeral: true
        });

    }

    if (!target.kickable) {

        return interaction.reply({
            content:
                '❌ Non posso espellere questo utente. Controlla la gerarchia dei ruoli.',
            ephemeral: true
        });

    }

    // =================================================
    // DM
    // =================================================

    try {

        const dmEmbed =
            new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle(
                    '👢 Sei stato espulso'
                )
                .setDescription(
                    `Sei stato espulso dal server **${interaction.guild.name}**.`
                )
                .addFields(
                    {
                        name: '👮 Moderatore',
                        value:
                            `${interaction.user}`,
                        inline: true
                    },
                    {
                        name: '📝 Motivo',
                        value:
                            reason,
                        inline: false
                    }
                )
                .setTimestamp();

        await user.send({
            embeds: [
                dmEmbed
            ]
        });

    } catch (error) {

        console.log(
            `⚠️ Impossibile inviare il DM a ${user.tag}.`
        );

    }

    // =================================================
    // KICK
    // =================================================

    try {

        await target.kick(
            reason
        );

    } catch (error) {

        console.error(
            '❌ Errore kick:',
            error
        );

        return interaction.reply({
            content:
                '❌ Non sono riuscito ad espellere l’utente.',
            ephemeral: true
        });

    }

    // =================================================
    // LOG
    // =================================================

    const logEmbed =
        new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle(
                '👢 Utente Espulso'
            )
            .setDescription(
                `👤 **Utente:** ${user}\n` +
                `🆔 **ID:** \`${user.id}\`\n` +
                `👮 **Moderatore:** ${interaction.user}\n` +
                `📝 **Motivo:** ${reason}`
            )
            .setTimestamp();

    await sendLog(
        MOD_LOG_CHANNEL_ID ||
        LOG_CHANNEL_ID,
        logEmbed
    );

    return interaction.reply({
        content:
            `✅ ${user.tag} è stato espulso dal server.`,
        ephemeral: true
    });

    }

// =====================================================
// SISTEMA SANZIONI PUBBLICHE
// =====================================================

async function sendPublicSanction(
    title,
    description
) {

    try {

        if (!SANCTIONS_CHANNEL_ID) {
            console.log(
                '⚠️ SANCTIONS_CHANNEL_ID non configurato nel .env.'
            );
            return;
        }

        const channel =
            await client.channels.fetch(
                SANCTIONS_CHANNEL_ID
            );

        if (!channel) {
            console.log(
                '⚠️ Canale sanzioni non trovato.'
            );
            return;
        }

        const embed =
            new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle(
                    `📢 ${title}`
                )
                .setDescription(
                    description
                )
                .setFooter({
                    text:
                        `${channel.guild.name} • Registro sanzioni`
                })
                .setTimestamp();

        await channel.send({
            embeds: [
                embed
            ]
        });

    } catch (error) {

        console.error(
            '❌ Errore invio sanzione pubblica:',
            error
        );

    }

}

// =====================================================
// CONVOCAZIONI - DATABASE
// =====================================================

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS convocations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guildId TEXT NOT NULL,
            userId TEXT NOT NULL,
            staffId TEXT NOT NULL,
            reason TEXT NOT NULL,
            createdAt INTEGER NOT NULL
        )
    `);

});

// =====================================================
// COMANDO /CONVOCA
// =====================================================

if (command === 'convoca') {

    if (!canModerate(interaction.member)) {

        return interaction.reply({
            content:
                '❌ Non hai il permesso di utilizzare questo comando.',
            ephemeral: true
        });

    }

    const user =
        interaction.options.getUser('utente');

    const reason =
        interaction.options.getString('motivo');

    if (!user) {

        return interaction.reply({
            content:
                '❌ Devi specificare un utente.',
            ephemeral: true
        });

    }

    db.run(
        `
        INSERT INTO convocations
        (
            guildId,
            userId,
            staffId,
            reason,
            createdAt
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            interaction.guild.id,
            user.id,
            interaction.user.id,
            reason,
            Date.now()
        ]
    );

    // =================================================
    // DM CONVOCAZIONE
    // =================================================

    try {

        const dmEmbed =
            new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(
                    '📣 Convocazione Staff'
                )
                .setDescription(
                    `Sei stato convocato dallo staff del server **${interaction.guild.name}**.`
                )
                .addFields(
                    {
                        name: '👮 Convocato da',
                        value:
                            `${interaction.user}`,
                        inline: true
                    },
                    {
                        name: '📝 Motivo',
                        value:
                            reason,
                        inline: false
                    }
                )
                .setFooter({
                    text:
                        'Sistema convocazioni'
                })
                .setTimestamp();

        await user.send({
            embeds: [
                dmEmbed
            ]
        });

    } catch (error) {

        console.log(
            `⚠️ Impossibile inviare la convocazione in DM a ${user.tag}.`
        );

    }

    // =================================================
    // LOG
    // =================================================

    const logEmbed =
        new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(
                '📣 Convocazione effettuata'
            )
            .setDescription(
                `👤 **Utente:** ${user}\n` +
                `👮 **Staff:** ${interaction.user}\n` +
                `📝 **Motivo:** ${reason}`
            )
            .setTimestamp();

    await sendLog(
        LOG_CHANNEL_ID,
        logEmbed
    );

    return interaction.reply({
        content:
            `✅ ${user} è stato convocato correttamente.`,
        ephemeral: true
    });

}

    }
);

// =====================================================
// SISTEMA VERIFICA DISCORD / ROBLOX
// =====================================================

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS verifications (
            userId TEXT PRIMARY KEY,
            guildId TEXT NOT NULL,
            discordVerified INTEGER DEFAULT 0,
            robloxVerified INTEGER DEFAULT 0,
            robloxUsername TEXT DEFAULT NULL,
            verifiedAt INTEGER DEFAULT NULL
        )
    `);

});

// =====================================================
// FUNZIONE VERIFICA UTENTE
// =====================================================

function saveVerification(
    userId,
    guildId,
    robloxUsername = null,
    robloxId = null
) {

    db.run(
        `
        INSERT INTO verifications
        (
            userId,
            guildId,
            discordVerified,
            robloxVerified,
            robloxId,
            robloxUsername,
            verifiedAt
        )
        VALUES (?, ?, 1, ?, ?, ?, ?)

        ON CONFLICT(userId)
        DO UPDATE SET
            discordVerified = 1,
            robloxVerified = excluded.robloxVerified,
            robloxId = excluded.robloxId,
            robloxUsername = excluded.robloxUsername,
            verifiedAt = excluded.verifiedAt
        `,
        [
            userId,
            guildId,
            robloxUsername ? 1 : 0,
            robloxId,
            robloxUsername,
            Date.now()
        ]
    );

}

async function fetchRobloxJson(
    url,
    options = {}
) {

    const response = await fetch(
        url,
        {
            ...options,
            signal: AbortSignal.timeout(10000),
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        }
    );

    if (!response.ok) {

        throw new Error(
            `Roblox API ${response.status} per ${url}`
        );

    }

    return response.json();

}

async function verifyRobloxAccount(
    username
) {

    if (!ROBLOX_GROUP_ID) {

        throw new Error(
            'ROBLOX_GROUP_ID non configurato nel file .env.'
        );

    }

    const result = await fetchRobloxJson(
        'https://users.roblox.com/v1/usernames/users',
        {
            method: 'POST',
            body: JSON.stringify({
                usernames: [username],
                excludeBannedUsers: false
            })
        }
    );

    const robloxUser = result.data?.[0];

    if (!robloxUser) return null;

    const groups = await fetchRobloxJson(
        `https://groups.roblox.com/v2/users/${robloxUser.id}/groups/roles`
    );

    const groupMembership = groups.data?.find(
        membership =>
            String(membership.group.id) === String(ROBLOX_GROUP_ID)
    );

    if (!groupMembership) {

        return {
            ...robloxUser,
            inConfiguredGroup: false
        };

    }

    return {
        ...robloxUser,
        inConfiguredGroup: true,
        groupRole: groupMembership.role.name
    };

}

// =====================================================
// PANNELLO VERIFICA
// =====================================================

async function sendVerificationPanel() {

    try {

        if (!VERIFICATION_CHANNEL_ID) {

            console.log(
                '⚠️ VERIFICATION_CHANNEL_ID non configurato.'
            );

            return;

        }

        const channel =
            await client.channels.fetch(
                VERIFICATION_CHANNEL_ID
            );

        if (!channel) return;

        const embed =
            new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(
                    '🛡️ Verifica account'
                )
                .setDescription(
                    'Benvenuto nel sistema di verifica!\n\n' +
                    'Per accedere completamente alla community devi completare la verifica del tuo account Discord.\n\n' +
                    '🔵 **Verifica Discord**\n' +
                    'Conferma la tua presenza nel server.\n\n' +
                    '🎮 **Verifica Roblox**\n' +
                    'Collega il tuo account Roblox alla community.\n\n' +
                    '⚠️ Segui attentamente le istruzioni mostrate dal bot.'
                )
                .setFooter({
                    text:
                        'Sistema di verifica'
                })
                .setTimestamp();

        const discordButton =
            new ButtonBuilder()
                .setCustomId(
                    'verify_discord'
                )
                .setLabel(
                    'Verifica Discord'
                )
                .setEmoji('🔵')
                .setStyle(
                    ButtonStyle.Primary
                );

        const robloxButton =
            new ButtonBuilder()
                .setCustomId(
                    'verify_roblox'
                )
                .setLabel(
                    'Verifica Roblox'
                )
                .setEmoji('🎮')
                .setStyle(
                    ButtonStyle.Success
                );

        const row =
            new ActionRowBuilder()
                .addComponents(
                    discordButton,
                    robloxButton
                );

        await channel.send({
            embeds: [
                embed
            ],
            components: [
                row
            ]
        });

        console.log(
            '✅ Pannello verifica inviato.'
        );

    } catch (error) {

        console.error(
            '❌ Errore pannello verifica:',
            error
        );

    }

}

// =====================================================
// INTERAZIONI VERIFICA
// =====================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isButton()) return;

        // =================================================
        // VERIFICA DISCORD
        // =================================================

        if (
            interaction.customId ===
            'verify_discord'
        ) {

            saveVerification(
                interaction.user.id,
                interaction.guild.id
            );

            const embed =
                new EmbedBuilder()
                    .setColor('#00FF88')
                    .setTitle(
                        '✅ Discord verificato'
                    )
                    .setDescription(
                        `Perfetto ${interaction.user}!\n\n` +
                        `Il tuo account Discord è stato verificato correttamente.`
                    )
                    .setTimestamp();

            return interaction.reply({
                embeds: [
                    embed
                ],
                ephemeral: true
            });

        }

        // =================================================
        // VERIFICA ROBLOX
        // =================================================

        if (
            interaction.customId ===
            'verify_roblox'
        ) {

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        'verify_roblox_modal'
                    )
                    .setTitle(
                        '🎮 Verifica Roblox'
                    );

            const usernameInput =
                new TextInputBuilder()
                    .setCustomId(
                        'roblox_username'
                    )
                    .setLabel(
                        'Username Roblox'
                    )
                    .setPlaceholder(
                        'Inserisci il tuo username Roblox'
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true)
                    .setMinLength(3)
                    .setMaxLength(32);

            modal.addComponents(
                new ActionRowBuilder()
                    .addComponents(
                        usernameInput
                    )
            );

            return interaction.showModal(
                modal
            );

        }

    }
);

// =====================================================
// MODAL VERIFICA ROBLOX
// =====================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isModalSubmit()) return;

        if (
            interaction.customId !==
            'verify_roblox_modal'
        ) return;

        const username =
            interaction.fields.getTextInputValue(
                'roblox_username'
            ).trim();

        await interaction.deferReply({
            ephemeral: true
        });

        try {

            const robloxUser =
                await verifyRobloxAccount(username);

            if (!robloxUser) {

                return interaction.editReply({
                    content:
                        '❌ Username Roblox non trovato.'
                });

            }

            if (!robloxUser.inConfiguredGroup) {

                return interaction.editReply({
                    content:
                        '❌ Devi essere membro del gruppo Roblox ufficiale per verificarti.'
                });

            }

            const member =
                await interaction.guild.members.fetch(
                    interaction.user.id
                );

            if (VERIFIED_ROLE_ID) {

                await member.roles.add(
                    VERIFIED_ROLE_ID,
                    'Verifica Roblox completata'
                );

            }

            if (ROBLOX_VERIFIED_ROLE_ID) {

                await member.roles.add(
                    ROBLOX_VERIFIED_ROLE_ID,
                    'Verifica Roblox completata'
                );

            }

            saveVerification(
                interaction.user.id,
                interaction.guild.id,
                robloxUser.name,
                String(robloxUser.id)
            );

            const embed =
                new EmbedBuilder()
                    .setColor('#00FF88')
                    .setTitle(
                        '🎮 Roblox verificato'
                    )
                    .setDescription(
                        `Il tuo account Roblox è stato verificato correttamente.\n\n` +
                        `🎮 **Username:** \`${robloxUser.name}\`\n` +
                        `🆔 **ID:** \`${robloxUser.id}\`\n` +
                        `👥 **Ruolo gruppo:** ${robloxUser.groupRole}`
                    )
                    .setFooter({
                        text:
                            'Sistema di verifica Roblox'
                    })
                    .setTimestamp();

            return interaction.editReply({
                embeds: [
                    embed
                ]
            });

        } catch (error) {

            console.error(
                '❌ Errore verifica Roblox:',
                error
            );

            return interaction.editReply({
                content:
                    '❌ Verifica Roblox non disponibile al momento. Riprova tra poco.'
            });

        }

    }
);

// =====================================================
// SISTEMA PARTNERSHIP
// =====================================================

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS partnerships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guildId TEXT NOT NULL,
            representativeId TEXT NOT NULL,
            serverName TEXT NOT NULL,
            description TEXT NOT NULL,
            stafferId TEXT NOT NULL,
            createdAt INTEGER NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS partnership_departures (
            guildId TEXT NOT NULL,
            representativeId TEXT NOT NULL,
            expiresAt INTEGER NOT NULL,
            PRIMARY KEY (guildId, representativeId)
        )
    `);

});

const partnershipDepartureTimers = new Map();
const partnershipDepartureWindow = 20 * 60 * 1000;

function getPartnershipRows(guildId, representativeId) {

    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM partnerships WHERE guildId = ? AND representativeId = ?`,
            [guildId, representativeId],
            (error, rows) => error ? reject(error) : resolve(rows || [])
        );
    });

}

function deletePartnershipDeparture(guildId, representativeId) {

    return new Promise((resolve, reject) => {
        db.run(
            `DELETE FROM partnership_departures WHERE guildId = ? AND representativeId = ?`,
            [guildId, representativeId],
            error => error ? reject(error) : resolve()
        );
    });

}

async function removeDepartedRepresentative(guildId, representativeId) {

    const guild = client.guilds.cache.get(guildId);
    const member = await guild?.members.fetch(representativeId).catch(() => null);

    if (member) {
        await deletePartnershipDeparture(guildId, representativeId).catch(() => {});
        return;
    }

    db.run(
        `DELETE FROM partnerships WHERE guildId = ? AND representativeId = ?`,
        [guildId, representativeId],
        error => {
            if (error) {
                console.error('❌ Errore eliminazione partnership:', error);
            } else {
                console.log(`🗑️ Partnership eliminate per ${representativeId}: membro non rientrato entro 20 minuti.`);
            }
        }
    );

    await deletePartnershipDeparture(guildId, representativeId).catch(() => {});
    partnershipDepartureTimers.delete(`${guildId}:${representativeId}`);

}

function schedulePartnershipRemoval(guildId, representativeId, expiresAt) {

    const timerKey = `${guildId}:${representativeId}`;
    const remaining = Math.max(0, expiresAt - Date.now());
    const oldTimer = partnershipDepartureTimers.get(timerKey);

    if (oldTimer) clearTimeout(oldTimer);

    const timer = setTimeout(
        () => removeDepartedRepresentative(guildId, representativeId),
        remaining
    );

    partnershipDepartureTimers.set(timerKey, timer);

}

async function restorePartnershipDepartures() {

    db.all(
        `SELECT * FROM partnership_departures`,
        async (error, rows) => {
            if (error) {
                console.error('❌ Errore lettura attese partnership:', error);
                return;
            }

            for (const departure of rows || []) {
                schedulePartnershipRemoval(
                    departure.guildId,
                    departure.representativeId,
                    departure.expiresAt
                );
            }
        }
    );

}

// =====================================================
// COMANDO /PARTNERSHIP
// =====================================================

if (false) client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isChatInputCommand()) return;

        const command =
            interaction.commandName;

        if (command === 'partnership') return;

if (command === 'partnership') {

    if (!hasRole(
        interaction.member,
        PARTNERSHIP_ROLE_ID
    ) && !canAdmin(interaction.member)) {

        return interaction.reply({
            content:
                '❌ Non hai il permesso di creare una partnership.',
            ephemeral: true
        });

    }

    const representative =
        interaction.options.getUser(
            'rappresentante'
        );

    if (!representative) {

        return interaction.reply({
            content:
                '❌ Devi specificare il rappresentante.',
            ephemeral: true
        });

    }

    // =================================================
    // MODAL PARTNERSHIP
    // =================================================

    const modal =
        new ModalBuilder()
            .setCustomId(
                `partnership_modal_${representative.id}`
            )
            .setTitle(
                '🤝 Nuova Partnership'
            );

    const serverNameInput =
        new TextInputBuilder()
            .setCustomId(
                'partnership_server'
            )
            .setLabel(
                'Nome del server'
            )
            .setPlaceholder(
                'Es. Emergenza IT | RP'
            )
            .setStyle(
                TextInputStyle.Short
            )
            .setRequired(true)
            .setMinLength(2)
            .setMaxLength(100);

    const descriptionInput =
        new TextInputBuilder()
            .setCustomId(
                'partnership_description'
            )
            .setLabel(
                'Descrizione del server'
            )
            .setPlaceholder(
                'Descrivi brevemente il server e cosa offre...'
            )
            .setStyle(
                TextInputStyle.Paragraph
            )
            .setRequired(true)
            .setMinLength(10)
            .setMaxLength(2000);

    modal.addComponents(
        new ActionRowBuilder()
            .addComponents(
                serverNameInput
            ),
        new ActionRowBuilder()
            .addComponents(
                descriptionInput
            )
    );

    return interaction.showModal(
        modal
    );

}

    }
);

// =====================================================
// MODAL PARTNERSHIP
// =====================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isModalSubmit()) return;

        if (
            !interaction.customId.startsWith(
                'partnership_modal_'
            )
        ) return;

        // =================================================
        // PERMESSI
        // =================================================

        if (
            !hasRole(
                interaction.member,
                PARTNERSHIP_ROLE_ID
            ) &&
            !canAdmin(interaction.member)
        ) {

            return interaction.reply({
                content:
                    '❌ Non hai il permesso di completare una partnership.',
                ephemeral: true
            });

        }

        const representativeId =
            interaction.customId.replace(
                'partnership_modal_',
                ''
            );

        const serverName =
            interaction.fields.getTextInputValue(
                'partnership_server'
            );

        const description =
            interaction.fields.getTextInputValue(
                'partnership_description'
            );

        const representative =
            await client.users.fetch(
                representativeId
            ).catch(
                () => null
            );

        if (!representative) {

            return interaction.reply({
                content:
                    '❌ Rappresentante non trovato.',
                ephemeral: true
            });

        }

        // =================================================
        // CANALE PARTNERSHIP
        // =================================================

        if (!PARTNERSHIP_CHANNEL_ID) {

            return interaction.reply({
                content:
                    '❌ Il canale partnership non è configurato nel file .env.',
                ephemeral: true
            });

        }

        const channel =
            await client.channels.fetch(
                PARTNERSHIP_CHANNEL_ID
            ).catch(
                () => null
            );

        if (!channel) {

            return interaction.reply({
                content:
                    '❌ Canale partnership non trovato.',
                ephemeral: true
            });

        }

        // =================================================
        // EMBED PARTNERSHIP
        // =================================================

        const partnershipEmbed =
            new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(
                    '🤝 NUOVA PARTNERSHIP'
                )
                .setDescription(
                    description
                )
                .addFields(
                    {
                        name: '👤 Rappresentante',
                        value:
                            `${representative}`,
                        inline: true
                    },
                    {
                        name: '🌐 Server',
                        value:
                            serverName,
                        inline: true
                    },
                    {
                        name: '🛡️ Staffer',
                        value:
                            `${interaction.user}`,
                        inline: true
                    }
                )
                .setFooter({
                    text:
                        `${interaction.guild.name} • Partnership`
                })
                .setTimestamp();

        // =================================================
        // INVIO
        // =================================================

        await channel.send({
            embeds: [
                partnershipEmbed
            ]
        });

        // =================================================
        // DATABASE
        // =================================================

        db.run(
            `
            INSERT INTO partnerships
            (
                guildId,
                representativeId,
                serverName,
                description,
                stafferId,
                createdAt
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                interaction.guild.id,
                representative.id,
                serverName,
                description,
                interaction.user.id,
                Date.now()
            ]
        );

        // =================================================
        // LOG
        // =================================================

        const logEmbed =
            new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(
                    '🤝 Partnership creata'
                )
                .setDescription(
                    `👤 **Rappresentante:** ${representative}\n` +
                    `🌐 **Server:** ${serverName}\n` +
                    `🛡️ **Staffer:** ${interaction.user}\n` +
                    `📝 **Descrizione:** ${description}`
                )
                .setTimestamp();

        await sendLog(
            LOG_CHANNEL_ID,
            logEmbed
        );

        return interaction.reply({
            content:
                `✅ Partnership di **${serverName}** pubblicata correttamente.`,
            ephemeral: true
        });

    }
);

// =====================================================
// SISTEMA COUNTING
// =====================================================

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS counting (
            guildId TEXT PRIMARY KEY,
            currentNumber INTEGER DEFAULT 0,
            lastUserId TEXT DEFAULT NULL
        )
    `);

});

// =====================================================
// INIZIALIZZA COUNTING
// =====================================================

function ensureCounting(guildId) {

    db.run(
        `
        INSERT OR IGNORE INTO counting
        (
            guildId,
            currentNumber,
            lastUserId
        )
        VALUES (?, 0, NULL)
        `,
        [guildId]
    );

}

async function askGemini(prompt, apiKey, keyName, responseMimeType = 'text/plain') {

    if (!apiKey) {

        throw new Error(`${keyName} non configurata.`);

    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ],
                generationConfig: {
                    maxOutputTokens: 800,
                    temperature: 0.7,
                    responseMimeType
                }
            }),
            signal: AbortSignal.timeout(30000)
        }
    );

    if (!response.ok) {

        const details = await response.text();

        throw new Error(
            `Gemini API ${response.status}: ${details.slice(0, 300)}`
        );

    }

    const result = await response.json();
    const answer = result.candidates?.[0]?.content?.parts
        ?.map(part => part.text || '')
        .join('')
        .trim();

    if (!answer) {

        throw new Error('Gemini non ha restituito una risposta.');

    }

    return answer;

}

const recentMessageTimes = new Map();
const recentJoins = new Map();
const moderationWindow = 24 * 60 * 60 * 1000;
let aiUnavailableUntil = 0;

const unsafeMessagePattern =
    /(f+u+c+k|stronz|cazz|merd|bastard|puttan|troia|vaff|nazist|terrorist|ammazz|uccid|discord\.gg\/)/i;

const allowedGifUrlPattern =
    /https?:\/\/[^\s]*(?:giphy\.com|tenor\.com|\.gif(?:\?[^\s]*)?)[^\s]*/gi;

function getModerationContent(message) {

    let content = message.content
        .replace(allowedGifUrlPattern, '')
        .trim();

    for (const attachment of message.attachments.values()) {

        const isGif =
            attachment.contentType === 'image/gif' ||
            attachment.name?.toLowerCase().endsWith('.gif');

        if (isGif) {
            content = content.replace(attachment.url, '').trim();
        }

    }

    return content;

}

function getRecentMessageModerations(userId, guildId) {

    return new Promise((resolve, reject) => {

        db.all(
            `
            SELECT * FROM message_moderation
            WHERE userId = ? AND guildId = ? AND deletedAt >= ?
            ORDER BY deletedAt ASC
            `,
            [userId, guildId, Date.now() - moderationWindow],
            (error, rows) => error ? reject(error) : resolve(rows || [])
        );

    });

}

async function assessNewMember(member) {

    const reasons = [];
    const accountAge = Date.now() - member.user.createdTimestamp;
    const localViolations = await getRecentMessageModerations(
        member.id,
        member.guild.id
    ).catch(() => []);

    if (accountAge < 3 * 24 * 60 * 60 * 1000) {
        reasons.push('account creato da meno di 3 giorni');
    } else if (accountAge < 7 * 24 * 60 * 60 * 1000) {
        reasons.push('account creato da meno di 7 giorni');
    }

    if (localViolations.length > 0) {
        reasons.push(`${localViolations.length} precedente/i di moderazione locale`);
    }

    return {
        isSuspicious: localViolations.length > 0 || accountAge < 3 * 24 * 60 * 60 * 1000,
        reasons
    };

}

function recordMessageModeration(userId, guildId, reason) {

    return new Promise((resolve, reject) => {

        db.run(
            `INSERT INTO message_moderation (userId, guildId, deletedAt, reason) VALUES (?, ?, ?, ?)`,
            [userId, guildId, Date.now(), reason],
            error => error ? reject(error) : resolve()
        );

    });

}

async function classifyMessageWithAI(content) {

    if (!AI_MODERATION_API_KEY || Date.now() < aiUnavailableUntil) return false;

    try {

        const answer = await askGemini(
            'Classifica il seguente messaggio Discord. Rispondi solo con JSON valido nel formato {"unsafe":true|false}. ' +
            'unsafe=true se contiene minacce, incitamento alla violenza, insulti gravi, odio, molestie o volgarita. ' +
            `Messaggio: ${JSON.stringify(content.slice(0, 1500))}`,
            AI_MODERATION_API_KEY,
            'AI_MODERATION_API_KEY',
            'application/json'
        );

        const jsonMatch = answer.match(/\{[\s\S]*?"unsafe"\s*:\s*(true|false)[\s\S]*?\}/i);

        if (!jsonMatch) {

            throw new Error('Risposta AI priva del campo unsafe.');

        }

        return JSON.parse(jsonMatch[0]).unsafe === true;

    } catch (error) {

        if (error.message.startsWith('Gemini API 429')) {
            aiUnavailableUntil = Date.now() + 5 * 60 * 1000;
        }

        console.error('Errore classificazione AI moderazione:', error.message);
        return false;

    }

}

async function moderateUserMessage(message, reason) {

    await message.delete().catch(() => {});
    await recordMessageModeration(message.author.id, message.guild.id, reason);

    const violations = await getRecentMessageModerations(
        message.author.id,
        message.guild.id
    );

    if (violations.length === 3) {

        await message.author.send(
            `⚠️ Nel server **${message.guild.name}** sono stati rimossi 3 tuoi messaggi nelle ultime 24 ore. ` +
            'Se il comportamento continua, riceverai un timeout.'
        ).catch(() => {});

    } else if (violations.length >= 4) {

        const member = await message.guild.members.fetch(message.author.id).catch(() => null);

        if (member?.moderatable) {

            const duration = member.communicationDisabledUntilTimestamp &&
                member.communicationDisabledUntilTimestamp > Date.now()
                ? 28 * 24 * 60 * 60 * 1000
                : 60 * 60 * 1000;

            await member.timeout(
                duration,
                violations.length === 4
                    ? 'Quarto messaggio moderato automaticamente'
                    : 'Recidiva entro 24 ore: timeout esteso'
            ).catch(() => {});

            await message.author.send(
                violations.length === 4
                    ? `⏱️ Hai ricevuto un timeout di 1 ora nel server **${message.guild.name}**.`
                    : `🛑 Il timeout è stato esteso a 28 giorni nel server **${message.guild.name}**. ` +
                      'Resterà attivo fino alla valutazione degli amministrativi.'
            ).catch(() => {});

        }

    }

    await sendLog(
        MOD_LOG_CHANNEL_ID || LOG_CHANNEL_ID,
        new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('🛡️ Messaggio rimosso automaticamente')
            .setDescription(
                `👤 **Utente:** ${message.author}\n` +
                `📍 **Canale:** ${message.channel}\n` +
                `📝 **Motivo:** ${reason}\n` +
                `🔢 **Rimozioni nelle 24h:** ${violations.length}`
            )
            .setTimestamp()
    );

}

// =====================================================
// EVENTO MESSAGGI - COUNTING
// =====================================================

client.on(
    'messageCreate',
    async message => {

        if (message.author.bot) return;

        if (isDuplicateEvent(message.id)) return;

        const now = Date.now();
        const messageTimes = (recentMessageTimes.get(message.author.id) || [])
            .filter(timestamp => now - timestamp < 8000);
        messageTimes.push(now);
        recentMessageTimes.set(message.author.id, messageTimes);

        if (messageTimes.length >= 5 && message.guild) {

            const member = await message.guild.members.fetch(message.author.id).catch(() => null);

            await message.delete().catch(() => {});
            if (member?.moderatable) {
                await member.timeout(10 * 60 * 1000, 'Anti-spam automatico').catch(() => {});
            }
            await sendLog(
                MOD_LOG_CHANNEL_ID || LOG_CHANNEL_ID,
                new EmbedBuilder()
                    .setColor('#FEE75C')
                    .setTitle('🚨 Anti-spam: intervento automatico')
                    .setDescription(`${message.author} ha inviato troppi messaggi in pochi secondi.`)
                    .setTimestamp()
            );
            recentMessageTimes.delete(message.author.id);
            return;

        }

        const moderationContent = getModerationContent(message);

        if (message.guild && unsafeMessagePattern.test(moderationContent)) {

            await moderateUserMessage(message, 'Contenuto potenzialmente offensivo, minaccioso o spam');
            return;

        }

        if (message.guild && moderationContent.length >= 4 && await classifyMessageWithAI(moderationContent)) {

            await moderateUserMessage(message, 'Rilevamento AI: contenuto non conforme');
            return;

        }

        if (
            message.mentions.has(client.user) &&
            !message.mentions.everyone
        ) {

            const prompt = message.content
                .replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '')
                .trim();

            if (!prompt) {

                return message.reply(
                    'Scrivimi una domanda dopo il mention.'
                );

            }

            if (!AI_RESPONSE_API_KEY) {

                return message.reply(
                    '❌ Il sistema AI non è configurato: manca AI_RESPONSE_API_KEY.'
                );

            }

            try {

                await message.channel.sendTyping();

                const answer = await askGemini(
                    prompt,
                    AI_RESPONSE_API_KEY,
                    'AI_RESPONSE_API_KEY'
                );
                const chunks = answer.match(/[\s\S]{1,1900}/g) || [];

                for (const chunk of chunks) {

                    await message.reply(chunk);

                }

            } catch (error) {

                console.error('❌ Errore Gemini:', error);

                return message.reply(
                    '❌ Non riesco a rispondere in questo momento. Riprova tra poco.'
                );

            }

            return;

        }

        if (!COUNTING_CHANNEL_ID) return;

        if (
            message.channel.id !==
            COUNTING_CHANNEL_ID
        ) return;

        ensureCounting(
            message.guild.id
        );

        db.get(
            `
            SELECT *
            FROM counting
            WHERE guildId = ?
            `,
            [
                message.guild.id
            ],
            async (error, data) => {

                if (error) {

                    console.error(
                        '❌ Errore database counting:',
                        error
                    );

                    return;

                }

                const expected =
                    (data?.currentNumber || 0) + 1;

                const number =
                    Number(
                        message.content.trim()
                    );

                // =================================================
                // NUMERO ERRATO
                // =================================================

                if (
                    !Number.isInteger(number) ||
                    number !== expected ||
                    data.lastUserId === message.author.id
                ) {

                    await message.channel.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('#ED4245')
                                    .setTitle(
                                        '❌ Counting interrotto'
                                    )
                                    .setDescription(
                                        data.lastUserId === message.author.id
                                            ? `${message.author}, non puoi contare due volte consecutivamente!`
                                            : `${message.author}, il prossimo numero era **${expected}**.`
                                    )
                                    .setFooter({
                                        text:
                                            'Il conteggio riparte da 0.'
                                    })
                                    .setTimestamp()
                            ]
                        });

                    db.run(
                        `
                        UPDATE counting
                        SET
                            currentNumber = 0,
                            lastUserId = NULL
                        WHERE guildId = ?
                        `,
                        [
                            message.guild.id
                        ]
                    );

                    return;

                }

                // =================================================
                // NUMERO CORRETTO
                // =================================================

                db.run(
                    `
                    UPDATE counting
                    SET
                        currentNumber = ?,
                        lastUserId = ?
                    WHERE guildId = ?
                    `,
                    [
                        number,
                        message.author.id,
                        message.guild.id
                    ]
                );

                try {

                    await message.react('✅');

                } catch (error) {

                    console.error(
                        '❌ Impossibile aggiungere ✅ al counting. Verifica il permesso Aggiungi reazioni:',
                        error.message
                    );

                }

                // =================================================
                // MESSAGGIO DI SUCCESSO
                // =================================================

                if (
                    number % 100 === 0
                ) {

                    const milestone =
                        await message.channel.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('#00FF88')
                                    .setTitle(
                                        '🎉 Traguardo raggiunto!'
                                    )
                                    .setDescription(
                                        `La community ha raggiunto il numero **${number}**!`
                                    )
                                    .setFooter({
                                        text:
                                            'Continuate così!'
                                    })
                                    .setTimestamp()
                            ]
                        });

                    setTimeout(
                        () => milestone.delete().catch(
                            () => {}
                        ),
                        7000
                    );

                }

            }
        );

    }
);

// =====================================================
// COMANDO /COUNTING
// =====================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isChatInputCommand()) return;

        const command =
            interaction.commandName;

if (command === 'counting') {

    if (!canAdmin(interaction.member)) {

        return interaction.reply({
            content:
                '❌ Solo gli amministratori possono utilizzare questo comando.',
            ephemeral: true
        });

    }

    if (!COUNTING_CHANNEL_ID) {

        return interaction.reply({
            content:
                '❌ COUNTING_CHANNEL_ID non è configurato nel file .env.',
            ephemeral: true
        });

    }

    ensureCounting(
        interaction.guild.id
    );

    return interaction.reply({
        content:
            `✅ Il sistema Counting è attivo nel canale <#${COUNTING_CHANNEL_ID}>.`,
        ephemeral: true
    });

}

    }
);

// =====================================================
// SISTEMA LOG ACCESSI / AZIONI STAFF
// =====================================================

client.on(
    'guildMemberRemove',
    async member => {

        const partnerships = await getPartnershipRows(
            member.guild.id,
            member.id
        ).catch(error => {
            console.error('❌ Errore ricerca partnership del membro uscito:', error);
            return [];
        });

        console.log(
            `📤 Uscita rilevata: ${member.user.tag} (${member.id}), partnership trovate: ${partnerships.length}`
        );

        if (partnerships.length > 0) {

            const expiresAt = Date.now() + partnershipDepartureWindow;

            db.run(
                `
                INSERT INTO partnership_departures (guildId, representativeId, expiresAt)
                VALUES (?, ?, ?)
                ON CONFLICT(guildId, representativeId)
                DO UPDATE SET expiresAt = excluded.expiresAt
                `,
                [member.guild.id, member.id, expiresAt],
                error => {
                    if (error) console.error('❌ Errore registrazione uscita partnership:', error);
                }
            );

            await member.user.send(
                `⚠️ Sei uscito dal server **${member.guild.name}**.\n\n` +
                'Sei il rappresentante di una o più partnership. Rientra entro **20 minuti**; in caso contrario, le partnership verranno eliminate automaticamente.'
            ).then(() => {
                console.log(`✅ Avviso partnership inviato in DM a ${member.user.tag}.`);
            }).catch(error => {
                console.error(`❌ DM non inviato a ${member.user.tag}: ${error.message}`);
                sendLog(
                    MOD_LOG_CHANNEL_ID || LOG_CHANNEL_ID,
                    new EmbedBuilder()
                        .setColor('#FEE75C')
                        .setTitle('⚠️ Avviso partnership non recapitato')
                        .setDescription(
                            `Non è stato possibile inviare il DM a ${member.user}.\n` +
                            'Discord non consente DM dopo l’uscita quando non esiste più un server in comune.\n' +
                            'Le partnership resteranno in attesa per 20 minuti e poi verranno eliminate se l’utente non rientra.'
                        )
                        .setTimestamp()
                ).catch(() => {});
            });

            schedulePartnershipRemoval(
                member.guild.id,
                member.id,
                expiresAt
            );

        }

        const embed =
            new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle(
                    '📤 Membro uscito dal server'
                )
                .setDescription(
                    `👤 **Utente:** ${member.user}\n` +
                    `🆔 **ID:** \`${member.id}\`\n` +
                    `📊 **Membri rimasti:** ${member.guild.memberCount}`
                )
                .setThumbnail(
                    member.user.displayAvatarURL({
                        extension: 'png'
                    })
                )
                .setTimestamp();

        await sendLog(
            LOG_CHANNEL_ID,
            embed
        );

    }
);

// =====================================================
// LOG CAMBIO RUOLI
// =====================================================

client.on(
    'guildMemberUpdate',
    async (oldMember, newMember) => {

        const oldRoles =
            new Set(
                oldMember.roles.cache.keys()
            );

        const newRoles =
            new Set(
                newMember.roles.cache.keys()
            );

        const addedRoles =
            [...newRoles]
                .filter(
                    roleId =>
                        !oldRoles.has(roleId)
                );

        const removedRoles =
            [...oldRoles]
                .filter(
                    roleId =>
                        !newRoles.has(roleId)
                );

        if (
            !addedRoles.length &&
            !removedRoles.length
        ) return;

        const added =
            addedRoles
                .map(
                    roleId =>
                        `<@&${roleId}>`
                )
                .join(', ') || 'Nessuno';

        const removed =
            removedRoles
                .map(
                    roleId =>
                        `<@&${roleId}>`
                )
                .join(', ') || 'Nessuno';

        const embed =
            new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(
                    '🎭 Modifica ruoli'
                )
                .setDescription(
                    `👤 **Utente:** ${newMember.user}\n` +
                    `🆔 **ID:** \`${newMember.id}\`\n\n` +
                    `➕ **Ruoli aggiunti:** ${added}\n` +
                    `➖ **Ruoli rimossi:** ${removed}`
                )
                .setTimestamp();

        await sendLog(
            LOG_CHANNEL_ID,
            embed
        );

    }
);

// =====================================================
// LOG MESSAGGI ELIMINATI
// =====================================================

client.on(
    'messageDelete',
    async message => {

        if (!message.guild) return;

        if (message.author?.bot) return;

        const content =
            message.content?.trim() ||
            '*Contenuto non disponibile*';

        const embed =
            new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle(
                    '🗑️ Messaggio eliminato'
                )
                .setDescription(
                    `👤 **Autore:** ${message.author || 'Sconosciuto'}\n` +
                    `📍 **Canale:** ${message.channel}\n\n` +
                    `💬 **Contenuto:**\n${content.slice(0, 3900)}`
                )
                .setTimestamp();

        await sendLog(
            LOG_CHANNEL_ID,
            embed
        );

    }
);

// =====================================================
// LOG MESSAGGI MODIFICATI
// =====================================================

client.on(
    'messageUpdate',
    async (oldMessage, newMessage) => {

        if (!newMessage.guild) return;

        if (newMessage.author?.bot) return;

        if (
            oldMessage.content ===
            newMessage.content
        ) return;

        const oldContent =
            oldMessage.content?.trim() ||
            '*Contenuto non disponibile*';

        const newContent =
            newMessage.content?.trim() ||
            '*Contenuto non disponibile*';

        const embed =
            new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle(
                    '✏️ Messaggio modificato'
                )
                .setDescription(
                    `👤 **Autore:** ${newMessage.author}\n` +
                    `📍 **Canale:** ${newMessage.channel}\n\n` +
                    `🔴 **Prima:**\n${oldContent.slice(0, 1800)}\n\n` +
                    `🟢 **Dopo:**\n${newContent.slice(0, 1800)}`
                )
                .setTimestamp();

        await sendLog(
            LOG_CHANNEL_ID,
            embed
        );

    }
);

// =====================================================
// LOG ENTRATA / USCITA VOCALE
// =====================================================

client.on(
    'voiceStateUpdate',
    async (oldState, newState) => {

        if (
            oldState.channelId ===
            newState.channelId
        ) return;

        let action = '🔊 Aggiornamento vocale';

        if (
            !oldState.channelId &&
            newState.channelId
        ) {

            action =
                '🔊 Entrato in vocale';

        } else if (
            oldState.channelId &&
            !newState.channelId
        ) {

            action =
                '🔇 Uscito dal vocale';

        } else {

            action =
                '🔄 Spostato di canale vocale';

        }

        const embed =
            new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(
                    action
                )
                .setDescription(
                    `👤 **Utente:** ${newState.member || oldState.member}\n` +
                    `📍 **Prima:** ${oldState.channel || 'Nessuno'}\n` +
                    `📍 **Dopo:** ${newState.channel || 'Nessuno'}`
                )
                .setTimestamp();

        await sendLog(
            LOG_CHANNEL_ID,
            embed
        );

    }
);

// =====================================================
// SISTEMA SANZIONI PUBBLICHE
// =====================================================

async function sendPublicSanction(
    type,
    user,
    moderator,
    reason,
    duration = null
) {

    if (!PUBLIC_SANCTIONS_CHANNEL_ID) return;

    try {

        const channel =
            await client.channels.fetch(
                PUBLIC_SANCTIONS_CHANNEL_ID
            );

        if (!channel) return;

        const embed =
            new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle(
                    `⚖️ Sanzione • ${type}`
                )
                .setDescription(
                    `È stata applicata una sanzione ad un membro della community.`
                )
                .addFields(
                    {
                        name: '👤 Utente',
                        value: `${user}`,
                        inline: true
                    },
                    {
                        name: '🛡️ Staffer',
                        value: `${moderator}`,
                        inline: true
                    },
                    {
                        name: '📝 Motivo',
                        value: reason || 'Non specificato',
                        inline: false
                    }
                )
                .setTimestamp();

        if (duration) {

            embed.addFields({
                name: '⏱️ Durata',
                value: duration,
                inline: true
            });

        }

        await channel.send({
            embeds: [embed]
        });

    } catch (error) {

        console.error(
            '❌ Errore sanzione pubblica:',
            error
        );

    }

}

// =====================================================
// DM SANZIONE
// =====================================================

async function sendSanctionDM(
    user,
    type,
    moderator,
    reason,
    duration = null
) {

    try {

        const embed =
            new EmbedBuilder()
                .setColor('#ED4245')
                .setTitle(
                    `⚠️ Hai ricevuto una sanzione • ${type}`
                )
                .setDescription(
                    `Ti è stata applicata una sanzione nel server **${moderator.guild.name}**.`
                )
                .addFields(
                    {
                        name: '🛡️ Staffer',
                        value: `${moderator}`,
                        inline: true
                    },
                    {
                        name: '📝 Motivo',
                        value: reason || 'Non specificato',
                        inline: false
                    }
                )
                .setFooter({
                    text: 'Sistema di moderazione'
                })
                .setTimestamp();

        if (duration) {

            embed.addFields({
                name: '⏱️ Durata',
                value: duration,
                inline: true
            });

        }

        await user.send({
            embeds: [embed]
        });

    } catch (error) {

        console.log(
            `⚠️ Impossibile inviare il DM di sanzione a ${user.id}.`
        );

    }

}

// =====================================================
// FUNZIONE LOG SANZIONE COMPLETA
// =====================================================

async function logSanction(
    type,
    user,
    moderator,
    reason,
    duration = null
) {

    const embed =
        new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle(
                `⚖️ Sanzione applicata • ${type}`
            )
            .setDescription(
                `Una sanzione è stata applicata ad un membro.`
            )
            .addFields(
                {
                    name: '👤 Utente',
                    value:
                        `${user}\n\`${user.id}\``,
                    inline: true
                },
                {
                    name: '🛡️ Staffer',
                    value:
                        `${moderator}\n\`${moderator.id}\``,
                    inline: true
                },
                {
                    name: '📝 Motivo',
                    value:
                        reason || 'Non specificato',
                    inline: false
                }
            )
            .setTimestamp();

    if (duration) {

        embed.addFields({
            name: '⏱️ Durata',
            value: duration,
            inline: true
        });

    }

    await sendLog(
        MOD_LOG_CHANNEL_ID || LOG_CHANNEL_ID,
        embed
    );

}

// =====================================================
// COMANDI SLASH - PANNELLI
// =====================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isChatInputCommand()) return;

        const command =
            interaction.commandName;

        if (command === 'alleanza') {

            if (!canAdmin(interaction.member)) {
                return denyPermission(interaction, '❌ Solo gli amministratori possono creare canali alleanza.');
            }

            if (!ALLIANCE_CATEGORY_ID) {
                return interaction.reply({
                    content: '❌ Configura ALLIANCE_CATEGORY_ID nel file .env.',
                    ephemeral: true
                });
            }

            const category = await interaction.guild.channels.fetch(ALLIANCE_CATEGORY_ID).catch(() => null);
            if (!category || category.type !== ChannelType.GuildCategory) {
                return interaction.reply({
                    content: '❌ Categoria zona alleanza non trovata.',
                    ephemeral: true
                });
            }

            const requestedName = interaction.options.getString('nome') || `alleanza-${Date.now().toString().slice(-4)}`;
            const safeName = requestedName.toLowerCase()
                .replace(/[^a-z0-9-]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 90) || 'alleanza';

            try {

                const channel = await interaction.guild.channels.create({
                    name: safeName,
                    type: ChannelType.GuildText,
                    parent: category.id,
                    topic: `Zona alleanza creata da ${interaction.user.tag}`,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                        }
                    ]
                });

                const ping = CITIZENS_ROLE_ID ? `<@&${CITIZENS_ROLE_ID}>` : '@everyone';
                await channel.send({
                    content: ping,
                    allowedMentions: CITIZENS_ROLE_ID
                        ? { roles: [CITIZENS_ROLE_ID] }
                        : { parse: ['everyone'] },
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#57F287')
                            .setTitle('🤝 Nuova zona alleanza')
                            .setDescription(`Canale creato da ${interaction.user}. Tutti i cittadini possono partecipare.`)
                            .setTimestamp()
                    ]
                });

                await sendLog(
                    LOG_CHANNEL_ID,
                    new EmbedBuilder()
                        .setColor('#57F287')
                        .setTitle('🤝 Canale alleanza creato')
                        .setDescription(`📍 **Canale:** ${channel}\n👮 **Amministratore:** ${interaction.user}`)
                        .setTimestamp()
                );

                return interaction.reply({
                    content: `✅ Canale alleanza creato: ${channel}`,
                    ephemeral: true
                });

            } catch (error) {

                console.error('Errore creazione canale alleanza:', error);
                return interaction.reply({
                    content: '❌ Non sono riuscito a creare il canale. Verifica il permesso Gestisci canali.',
                    ephemeral: true
                });

            }

        }

// =====================================================
// COMANDO /PANNELLO-TICKET
// =====================================================

if (
    command === 'panello-fazioni' ||
    command === 'pannelo-fazioni'
) {

    if (!canAdmin(interaction.member)) {

        return interaction.reply({
            content: '❌ Solo gli amministratori possono inviare il pannello fazioni.',
            ephemeral: true
        });

    }

    if (!FAZIONI_PANEL_CHANNEL_ID) {

        return interaction.reply({
            content: '❌ FAZIONI_PANEL_CHANNEL_ID non è configurato nel file .env.',
            ephemeral: true
        });

    }

    const channel = await client.channels.fetch(
        FAZIONI_PANEL_CHANNEL_ID
    ).catch(() => null);

    if (!channel) {

        return interaction.reply({
            content: '❌ Canale pannello fazioni non trovato.',
            ephemeral: true
        });

    }

    const embed =
        new EmbedBuilder()
            .setColor('#E67E22')
            .setTitle('🚨 SUPPORTO FAZIONI')
            .setDescription(
                'Benvenuto nel centro assistenza dedicato alle fazioni!\n\n' +
                'Seleziona dal menu la fazione più adatta alla tua richiesta.\n\n' +
                '🚓 **Supporto FDO**\n' +
                'Richieste rivolte agli addetti della Forza dell’Ordine.\n\n' +
                '🚑 **Supporto Sanitari**\n' +
                'Richieste rivolte agli addetti del personale sanitario.\n\n' +
                '🚒 **Supporto Anti-incendio**\n' +
                'Richieste rivolte agli addetti del corpo anti-incendio.\n\n' +
                '🚧 **Supporto Stradale**\n' +
                'Richieste rivolte agli addetti del servizio stradale.\n\n' +
                '⚠️ Apri un solo ticket per la stessa richiesta.'
            )
            .setFooter({
                text: `${interaction.guild.name} • Sistema Fazioni`
            })
            .setTimestamp();

    const menu =
        new StringSelectMenuBuilder()
            .setCustomId('fazioni_category_select')
            .setPlaceholder('🚨 Seleziona il supporto necessario')
            .addOptions(
                Object.entries(factionTicketTypes).map(
                    ([value, faction]) => ({
                        label: faction.label,
                        description: faction.description,
                        value,
                        emoji: faction.emoji
                    })
                )
            );

    await channel.send({
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(menu)
        ]
    });

    return interaction.reply({
        content: `✅ Pannello fazioni inviato in ${channel}.`,
        ephemeral: true
    });

}

if (command === 'pannello-ticket') {

    if (!canAdmin(interaction.member)) {

        return interaction.reply({
            content:
                '❌ Solo gli amministratori possono inviare il pannello ticket.',
            ephemeral: true
        });

    }

    if (!TICKET_PANEL_CHANNEL_ID) {

        return interaction.reply({
            content:
                '❌ TICKET_PANEL_CHANNEL_ID non è configurato nel file .env.',
            ephemeral: true
        });

    }

    try {

        const channel =
            await client.channels.fetch(
                TICKET_PANEL_CHANNEL_ID
            );

        if (!channel) {

            return interaction.reply({
                content:
                    '❌ Canale del pannello ticket non trovato.',
                ephemeral: true
            });

        }

        const embed =
            new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(
                    '🎫 Centro Assistenza'
                )
                .setDescription(
                    'Hai bisogno di assistenza? Apri un ticket selezionando una delle categorie disponibili.\n\n' +
                    '🔧 **Assistenza Generale**\n' +
                    'Problemi, domande o richieste generali.\n\n' +
                    '👑 **Team gestionale**\n' +
                    'Contatta direttamente il team gestionale.\n\n' +
                    '🛡️ **Amministrazione**\n' +
                    'Richieste rivolte all’amministrazione.\n\n' +
                    '🤝 **Partnership**\n' +
                    'Richieste e proposte di collaborazione.\n\n' +
                    '⚠️ **Apri un solo ticket per ogni richiesta.**'
                )
                .setFooter({
                    text:
                        `${interaction.guild.name} • Sistema Ticket`
                })
                .setTimestamp();

        const menu =
            new StringSelectMenuBuilder()
                .setCustomId(
                    'ticket_category_select'
                )
                .setPlaceholder(
                    '🎫 Seleziona una categoria'
                )
                .addOptions(
                    {
                        label:
                            'Assistenza Generale',
                        description:
                            'Ricevi assistenza dallo staff.',
                        value:
                            'assistenza',
                        emoji:
                            '🔧'
                    },
                    {
                        label:
                            'Team gestionale',
                        description:
                            'Contatta il team gestionale.',
                        value:
                            'gestionali',
                        emoji:
                            '👑'
                    },
                    {
                        label:
                            'Amministrazione',
                        description:
                            'Richieste per l’amministrazione.',
                        value:
                            'amministrazione',
                        emoji:
                            '🛡️'
                    },
                    {
                        label:
                            'Partnership',
                        description:
                            'Proposte di collaborazione.',
                        value:
                            'partnership',
                        emoji:
                            '🤝'
                    }
                );

        const row =
            new ActionRowBuilder()
                .addComponents(
                    menu
                );

        await channel.send({
            embeds: [
                embed
            ],
            components: [
                row
            ]
        });

        return interaction.reply({
            content:
                `✅ Pannello ticket inviato in ${channel}.`,
            ephemeral: true
        });

    } catch (error) {

        console.error(
            '❌ Errore invio pannello ticket:',
            error
        );

        return interaction.reply({
            content:
                '❌ Errore durante l’invio del pannello ticket.',
            ephemeral: true
        });

    }

}

// =====================================================
// COMANDO /PANNELLO-VERIFICA
// =====================================================

if (command === 'pannello-verifica') {

    if (!canAdmin(interaction.member)) {

        return interaction.reply({
            content:
                '❌ Solo gli amministratori possono inviare il pannello verifica.',
            ephemeral: true
        });

    }

    if (!VERIFICATION_CHANNEL_ID) {

        return interaction.reply({
            content:
                '❌ VERIFICATION_CHANNEL_ID non è configurato nel file .env.',
            ephemeral: true
        });

    }

    try {

        const channel =
            await client.channels.fetch(
                VERIFICATION_CHANNEL_ID
            );

        if (!channel) {

            return interaction.reply({
                content:
                    '❌ Canale verifica non trovato.',
                ephemeral: true
            });

        }

        const embed =
            new EmbedBuilder()
                .setColor('#00B0F4')
                .setTitle(
                    '🛡️ Verifica della community'
                )
                .setDescription(
                    'Prima di accedere completamente alla community devi completare la verifica.\n\n' +
                    '🔵 **Verifica Discord**\n' +
                    'Conferma il tuo account Discord.\n\n' +
                    '🎮 **Verifica Roblox**\n' +
                    'Inserisci il tuo username Roblox.\n\n' +
                    'Clicca il pulsante corrispondente per iniziare.'
                )
                .setFooter({
                    text:
                        `${interaction.guild.name} • Sistema Verifica`
                })
                .setTimestamp();

        const discordButton =
            new ButtonBuilder()
                .setCustomId(
                    'verify_discord'
                )
                .setLabel(
                    'Verifica Discord'
                )
                .setEmoji(
                    '🔵'
                )
                .setStyle(
                    ButtonStyle.Primary
                );

        const robloxButton =
            new ButtonBuilder()
                .setCustomId(
                    'verify_roblox'
                )
                .setLabel(
                    'Verifica Roblox'
                )
                .setEmoji(
                    '🎮'
                )
                .setStyle(
                    ButtonStyle.Success
                );

        const row =
            new ActionRowBuilder()
                .addComponents(
                    discordButton,
                    robloxButton
                );

        await channel.send({
            embeds: [
                embed
            ],
            components: [
                row
            ]
        });

        return interaction.reply({
            content:
                `✅ Pannello verifica inviato in ${channel}.`,
            ephemeral: true
        });

    } catch (error) {

        console.error(
            '❌ Errore pannello verifica:',
            error
        );

        return interaction.reply({
            content:
                '❌ Errore durante l’invio del pannello verifica.',
            ephemeral: true
        });

    }

}

// =====================================================
// COMANDO /PARTNERSHIP
// =====================================================

if (command === 'partnership') {

    if (
        !hasRole(
            interaction.member,
            PARTNERSHIP_ROLE_ID
        ) &&
        !canAdmin(interaction.member)
    ) {

        return interaction.reply({
            content:
                '❌ Non hai il permesso di creare partnership.',
            ephemeral: true
        });

    }

    const representative =
        interaction.options.getUser(
            'rappresentante'
        );

    if (!representative) {

        return interaction.reply({
            content:
                '❌ Devi indicare il rappresentante.',
            ephemeral: true
        });

    }

    const modal =
        new ModalBuilder()
            .setCustomId(
                `partnership_create_${representative.id}`
            )
            .setTitle(
                '🤝 Crea Partnership'
            );

    const serverInput =
        new TextInputBuilder()
            .setCustomId(
                'server_name'
            )
            .setLabel(
                'Nome del server'
            )
            .setPlaceholder(
                'Emergenza IT | RP'
            )
            .setStyle(
                TextInputStyle.Short
            )
            .setRequired(true)
            .setMaxLength(100);

    const descriptionInput =
        new TextInputBuilder()
            .setCustomId(
                'server_description'
            )
            .setLabel(
                'Descrizione del server'
            )
            .setPlaceholder(
                'Descrivi il server e la sua community...'
            )
            .setStyle(
                TextInputStyle.Paragraph
            )
            .setRequired(true)
            .setMinLength(10)
            .setMaxLength(2000);

    modal.addComponents(

        new ActionRowBuilder()
            .addComponents(
                serverInput
            ),

        new ActionRowBuilder()
            .addComponents(
                descriptionInput
            )

    );

    return interaction.showModal(
        modal
    );

}

    }
);

// =====================================================
// MODAL PARTNERSHIP
// =====================================================

client.on(
    'interactionCreate',
    async interaction => {

        if (!interaction.isModalSubmit()) return;

        if (
            !interaction.customId.startsWith(
                'partnership_create_'
            )
        ) return;

        const representativeId =
            interaction.customId.replace(
                'partnership_create_',
                ''
            );

        const serverName =
            interaction.fields.getTextInputValue(
                'server_name'
            );

        const description =
            interaction.fields.getTextInputValue(
                'server_description'
            );

        const representative =
            await client.users.fetch(
                representativeId
            ).catch(
                () => null
            );

        if (!representative) {

            return interaction.reply({
                content:
                    '❌ Rappresentante non trovato.',
                ephemeral: true
            });

        }

        if (!PARTNERSHIP_CHANNEL_ID) {

            return interaction.reply({
                content:
                    '❌ PARTNERSHIP_CHANNEL_ID non configurato nel .env.',
                ephemeral: true
            });

        }

        const partnershipChannel =
            await client.channels.fetch(
                PARTNERSHIP_CHANNEL_ID
            ).catch(
                () => null
            );

        if (!partnershipChannel) {

            return interaction.reply({
                content:
                    '❌ Canale partnership non trovato.',
                ephemeral: true
            });

        }

        // =================================================
        // EMBED PUBBLICO
        // =================================================

        const partnershipEmbed =
            new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(
                    '🤝 PARTNERSHIP'
                )
                .setDescription(
                    `## 🌐 ${serverName}\n\n` +
                    `${description}\n\n` +
                    '━━━━━━━━━━━━━━━━━━━━'
                )
                .addFields(
                    {
                        name:
                            '👤 Rappresentante',
                        value:
                            `${representative}`,
                        inline: true
                    },
                    {
                        name:
                            '🛡️ Staffer',
                        value:
                            `${interaction.user}`,
                        inline: true
                    }
                )
                .setThumbnail(
                    interaction.guild.iconURL({
                        extension: 'png',
                        size: 1024
                    })
                )
                .setFooter({
                    text:
                        `${interaction.guild.name} • Partnership`
                })
                .setTimestamp();

        // =================================================
        // MESSAGGIO PUBBLICO
        // =================================================

        await partnershipChannel.send({
            content: `🤝 **Nuova partnership con ${serverName}**`,
            embeds: [
                partnershipEmbed
            ]
        });

        const representativeEmbed =
            new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🤝 Grazie per la partnership!')
                .setDescription(
                    `Grazie per aver creato una partnership con **${interaction.guild.name}**!\n\n` +
                    `Ti ricordiamo che sei il rappresentante della partnership **${serverName}**.`
                )
                .addFields({
                    name: '⚠️ Regola importante',
                    value:
                        'Se uscirai dal server, avrai **20 minuti** per rientrare. Se non rientrerai entro questo periodo, tutte le partnership in cui sei il rappresentante verranno eliminate automaticamente.'
                })
                .setFooter({
                    text: `${interaction.guild.name} • Sistema Partnership`
                })
                .setTimestamp();

        await representative.send({
            embeds: [representativeEmbed]
        }).catch(error => {
            console.error(`⚠️ Avviso regola partnership non inviato a ${representative.tag}: ${error.message}`);
        });

        // =================================================
        // LOG PRIVATO
        // =================================================

        const logEmbed =
            new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(
                    '🤝 Partnership pubblicata'
                )
                .setDescription(
                    `👤 **Rappresentante:** ${representative}\n` +
                    `🌐 **Server:** ${serverName}\n` +
                    `🛡️ **Staffer:** ${interaction.user}\n\n` +
                    `📝 **Descrizione:**\n${description}`
                )
                .setTimestamp();

        await sendLog(
            LOG_CHANNEL_ID,
            logEmbed
        );

        db.run(
            `
            INSERT INTO partnerships
            (guildId, representativeId, serverName, description, stafferId, createdAt)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                interaction.guild.id,
                representative.id,
                serverName,
                description,
                interaction.user.id,
                Date.now()
            ],
            error => {
                if (error) console.error('❌ Errore salvataggio partnership:', error);
            }
        );

        return interaction.reply({
            content:
                `✅ La partnership con **${serverName}** è stata pubblicata.`,
            ephemeral: true
        });

    }
);

// =====================================================
// COMANDI SLASH - UTILITY
// =====================================================

if (false) client.on(
    'interactionCreate',
    async interaction => {

        return;

        if (!interaction.isChatInputCommand()) return;

        const command =
            interaction.commandName;

// =====================================================
// COMANDO /PING
// =====================================================

if (command === 'ping') {

    const latency =
        Date.now() -
        interaction.createdTimestamp;

    const embed =
        new EmbedBuilder()
            .setColor('#00FF88')
            .setTitle('🏓 Pong!')
            .setDescription(
                `🤖 **Bot:** ${latency}ms\n` +
                `💓 **WebSocket:** ${client.ws.ping}ms`
            )
            .setFooter({
                text:
                    `${interaction.guild.name} • Utility`
            })
            .setTimestamp();

    return interaction.reply({
        embeds: [
            embed
        ]
    });

}

// =====================================================
// COMANDO /AVATAR
// =====================================================

if (command === 'avatar') {

    const user =
        interaction.options.getUser(
            'utente'
        ) ||
        interaction.user;

    const avatar =
        user.displayAvatarURL({
            extension: 'png',
            size: 4096
        });

    const embed =
        new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(
                `🖼️ Avatar di ${user.username}`
            )
            .setImage(
                avatar
            )
            .setURL(
                avatar
            )
            .setFooter({
                text:
                    `Richiesto da ${interaction.user.tag}`
            })
            .setTimestamp();

    return interaction.reply({
        embeds: [
            embed
        ]
    });

}

// =====================================================
// COMANDO /USERINFO
// =====================================================

if (command === 'userinfo') {

    const user =
        interaction.options.getUser(
            'utente'
        ) ||
        interaction.user;

    const member =
        await interaction.guild.members
            .fetch(user.id)
            .catch(
                () => null
            );

    const roles =
        member
            ? member.roles.cache
                .filter(
                    role =>
                        role.id !==
                        interaction.guild.id
                )
                .map(
                    role =>
                        `${role}`
                )
                .join(', ')
            : 'Non presente nel server';

    const embed =
        new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(
                `👤 Informazioni • ${user.username}`
            )
            .setThumbnail(
                user.displayAvatarURL({
                    extension: 'png',
                    size: 1024
                })
            )
            .addFields(
                {
                    name:
                        '👤 Username',
                    value:
                        `${user.tag}`,
                    inline: true
                },
                {
                    name:
                        '🆔 ID',
                    value:
                        `\`${user.id}\``,
                    inline: true
                },
                {
                    name:
                        '📅 Account creato',
                    value:
                        `<t:${Math.floor(
                            user.createdTimestamp / 1000
                        )}:F>`,
                    inline: false
                },
                {
                    name:
                        '🎭 Ruoli',
                    value:
                        roles.slice(0, 1024),
                    inline: false
                }
            )
            .setTimestamp();

    if (member) {

        embed.addFields({
            name:
                '📥 Entrato nel server',
            value:
                member.joinedTimestamp
                    ? `<t:${Math.floor(
                        member.joinedTimestamp / 1000
                    )}:F>`
                    : 'Non disponibile',
            inline: false
        });

    }

    return interaction.reply({
        embeds: [
            embed
        ]
    });

}

// =====================================================
// COMANDO /SERVERINFO
// =====================================================

if (command === 'serverinfo') {

    const guild =
        interaction.guild;

    const owner =
        await guild.fetchOwner()
            .catch(
                () => null
            );

    const embed =
        new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(
                `🏠 ${guild.name}`
            )
            .setThumbnail(
                guild.iconURL({
                    extension: 'png',
                    size: 1024
                })
            )
            .addFields(
                {
                    name:
                        '👑 Proprietario',
                    value:
                        owner
                            ? `${owner.user}`
                            : 'Non disponibile',
                    inline: true
                },
                {
                    name:
                        '👥 Membri',
                    value:
                        `${guild.memberCount}`,
                    inline: true
                },
                {
                    name:
                        '💬 Canali',
                    value:
                        `${guild.channels.cache.size}`,
                    inline: true
                },
                {
                    name:
                        '🎭 Ruoli',
                    value:
                        `${guild.roles.cache.size}`,
                    inline: true
                },
                {
                    name:
                        '🚀 Boost',
                    value:
                        `${guild.premiumSubscriptionCount || 0}`,
                    inline: true
                },
                {
                    name:
                        '🆔 Server ID',
                    value:
                        `\`${guild.id}\``,
                    inline: true
                },
                {
                    name:
                        '📅 Creato',
                    value:
                        `<t:${Math.floor(
                            guild.createdTimestamp / 1000
                        )}:F>`,
                    inline: false
                }
            )
            .setFooter({
                text:
                    'Informazioni server'
            })
            .setTimestamp();

    return interaction.reply({
        embeds: [
            embed
        ]
    });

}

    }
);

// =====================================================
// FUNZIONI DI CONTROLLO RUOLI
// =====================================================

function hasRole(
    member,
    roleId
) {

    if (!member || !roleId) {
        return false;
    }

    return member.roles.cache.has(
        roleId
    );

}

// =====================================================
// CONTROLLO STAFF
// =====================================================

function isStaff(
    member
) {

    return (
        hasRole(
            member,
            STAFF_ROLE_ID
        ) ||
        hasRole(
            member,
            ADMIN_ROLE_ID
        ) ||
        hasRole(
            member,
            GESTIONALE_ROLE_ID
        )
    );

}

// =====================================================
// CONTROLLO AMMINISTRATORE
// =====================================================

function canAdmin(
    member
) {

    if (!member) {
        return false;
    }

    return (
        hasRole(
            member,
            ADMIN_ROLE_ID
        ) ||
        member.permissions.has(
            PermissionsBitField.Flags.Administrator
        )
    );

}

// =====================================================
// CONTROLLO MODERAZIONE
// =====================================================

function canModerate(
    member
) {

    if (!member) {
        return false;
    }

    return (
        hasRole(
            member,
            STAFF_ROLE_ID
        ) ||
        hasRole(
            member,
            MOD_ROLE_ID
        ) ||
        canAdmin(member)
    );

}

// =====================================================
// CONTROLLO GESTIONALI
// =====================================================

function isGestionale(
    member
) {

    return (
        hasRole(
            member,
            GESTIONALE_ROLE_ID
        ) ||
        canAdmin(member)
    );

}

// =====================================================
// CONTROLLO PARTNERSHIP
// =====================================================

function canPartnership(
    member
) {

    return (
        hasRole(
            member,
            PARTNERSHIP_ROLE_ID
        ) ||
        canAdmin(member)
    );

}

// =====================================================
// FUNZIONE RISPOSTA PERMESSO
// =====================================================

async function denyPermission(
    interaction,
    message =
        '❌ Non hai il permesso di utilizzare questa funzione.'
) {

    if (interaction.replied || interaction.deferred) {

        return interaction.followUp({
            content:
                message,
            ephemeral: true
        });

    }

    return interaction.reply({
        content:
            message,
        ephemeral: true
    });

}

// =====================================================
// FUNZIONE CONTROLLO CANALE TESTUALE
// =====================================================

function isTextChannel(
    channel
) {

    return (
        channel &&
        channel.type === ChannelType.GuildText
    );

}

// =====================================================
// FUNZIONE CONTROLLO BOT PERMESSI
// =====================================================

function botHasPermission(
    guild,
    permission
) {

    const me =
        guild.members.me;

    if (!me) {
        return false;
    }

    return me.permissions.has(
        permission
    );

}

// =====================================================
// CONTROLLO GENERALE PERMESSI BOT
// =====================================================

function checkBotPermissions(
    guild
) {

    const required = [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.EmbedLinks,
        PermissionsBitField.Flags.ReadMessageHistory,
        PermissionsBitField.Flags.ManageChannels,
        PermissionsBitField.Flags.ManageRoles,
        PermissionsBitField.Flags.ModerateMembers,
        PermissionsBitField.Flags.KickMembers,
        PermissionsBitField.Flags.BanMembers
    ];

    return required.filter(
        permission =>
            !botHasPermission(
                guild,
                permission
            )
    );

}

// =====================================================
// FUNZIONI UTILITY DATABASE
// =====================================================

function getUserWarnings(userId, guildId) {

    return new Promise((resolve, reject) => {

        db.all(
            `
            SELECT *
            FROM warnings
            WHERE userId = ?
            AND guildId = ?
            ORDER BY createdAt DESC
            `,
            [
                userId,
                guildId
            ],
            (error, rows) => {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(rows || []);

            }
        );

    });

}

// =====================================================
// AGGIUNGI RICHIAMO
// =====================================================

function addWarning(
    userId,
    guildId,
    moderatorId,
    reason
) {

    return new Promise((resolve, reject) => {

        db.run(
            `
            INSERT INTO warnings
            (
                userId,
                guildId,
                moderatorId,
                reason,
                createdAt
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                userId,
                guildId,
                moderatorId,
                reason,
                Date.now()
            ],
            function(error) {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(this.lastID);

            }
        );

    });

}

// =====================================================
// CANCELLA RICHIAMI
// =====================================================

function clearWarnings(
    userId,
    guildId
) {

    return new Promise((resolve, reject) => {

        db.run(
            `
            DELETE FROM warnings
            WHERE userId = ?
            AND guildId = ?
            `,
            [
                userId,
                guildId
            ],
            function(error) {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(this.changes);

            }
        );

    });

}

// =====================================================
// FORMATTA RICHIAMI
// =====================================================

function formatWarnings(
    warnings
) {

    if (!warnings.length) {

        return 'Nessun richiamo presente.';

    }

    return warnings
        .map(
            (warning, index) => {

                const timestamp =
                    Math.floor(
                        warning.createdAt / 1000
                    );

                return (
                    `**${index + 1}.** ${warning.reason}\n` +
                    `👮 Moderatore: <@${warning.moderatorId}>\n` +
                    `📅 <t:${timestamp}:F>`
                );

            }
        )
        .join('\n\n');

}

// =====================================================
// LOG MODERAZIONE
// =====================================================

async function sendModerationLog(
    title,
    color,
    description
) {

    const embed =
        new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();

    await sendLog(
        MOD_LOG_CHANNEL_ID ||
        LOG_CHANNEL_ID,
        embed
    );

}

// =====================================================
// LOG BOT
// =====================================================

async function sendBotLog(
    title,
    description,
    color = '#5865F2'
) {

    const embed =
        new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();

    await sendLog(
        BOT_LOG_CHANNEL_ID,
        embed
    );

}

// =====================================================
// CONTROLLO CONFIGURAZIONE
// =====================================================

function checkConfiguration() {

    const requiredChannels = [
        [
            'WELCOME_CHANNEL_ID',
            WELCOME_CHANNEL_ID
        ],
        [
            'LOG_CHANNEL_ID',
            LOG_CHANNEL_ID
        ],
        [
            'MOD_LOG_CHANNEL_ID',
            MOD_LOG_CHANNEL_ID
        ],
        [
            'BAN_LOG_CHANNEL_ID',
            BAN_LOG_CHANNEL_ID
        ],
        [
            'BOT_LOG_CHANNEL_ID',
            BOT_LOG_CHANNEL_ID
        ],
        [
            'TICKET_PANEL_CHANNEL_ID',
            TICKET_PANEL_CHANNEL_ID
        ],
        [
            'FAZIONI_PANEL_CHANNEL_ID',
            FAZIONI_PANEL_CHANNEL_ID
        ]
    ];

    const missingChannels =
        requiredChannels
            .filter(
                ([, value]) =>
                    !value
            )
            .map(
                ([name]) =>
                    name
            );

    if (missingChannels.length) {

        console.warn(
            '⚠️ Canali mancanti nel .env:',
            missingChannels.join(', ')
        );

    }

    const requiredRoles = [
        [
            'STAFF_ROLE_ID',
            STAFF_ROLE_ID
        ],
        [
            'ADMIN_ROLE_ID',
            ADMIN_ROLE_ID
        ],
        [
            'GESTIONALE_ROLE_ID',
            GESTIONALE_ROLE_ID
        ],
        [
            'ROBLOX_VERIFIED_ROLE_ID',
            ROBLOX_VERIFIED_ROLE_ID
        ],
        [
            'FDO_ROLE_ID',
            FDO_ROLE_ID
        ],
        [
            'SANITARI_ROLE_ID',
            SANITARI_ROLE_ID
        ],
        [
            'ANTINCENDIO_ROLE_ID',
            ANTINCENDIO_ROLE_ID
        ],
        [
            'STRADALE_ROLE_ID',
            STRADALE_ROLE_ID
        ]
    ];

    const missingRoles =
        requiredRoles
            .filter(
                ([, value]) =>
                    !value
            )
            .map(
                ([name]) =>
                    name
            );

    if (missingRoles.length) {

        console.warn(
            '⚠️ Ruoli mancanti nel .env:',
            missingRoles.join(', ')
        );

    }

    if (!ROBLOX_GROUP_ID) {

        console.warn(
            '⚠️ ROBLOX_GROUP_ID mancante nel .env: la verifica Roblox resterà disabilitata.'
        );

    }

    if (
        FAZIONI_OPEN_CATEGORY_ID ===
        FAZIONI_CLAIMED_CATEGORY_ID
    ) {

        console.warn(
            '⚠️ FAZIONI_OPEN_CATEGORY_ID e FAZIONI_CLAIMED_CATEGORY_ID devono essere categorie diverse.'
        );

    }

}

// =====================================================
// CONTROLLO AVVIO
// =====================================================

client.once(
    'ready',
    () => {

        checkConfiguration();

        console.log(
            '✅ Controllo configurazione completato.'
        );

    }
);

// =====================================================
// AVVIO FINALE BOT
// =====================================================

// Controllo configurazione principale
if (!TOKEN) {

    console.error(
        '❌ TOKEN mancante nel file .env.'
    );

} else if (!CLIENT_ID) {

    console.error(
        '❌ CLIENT_ID mancante nel file .env.'
    );

} else if (!GUILD_ID) {

    console.error(
        '❌ GUILD_ID mancante nel file .env.'
    );

} else {

    client.login(TOKEN)
        .then(() => {

            console.log(
                '✅ Login Discord completato.'
            );

        })
        .catch(error => {

            console.error(
                '❌ Errore durante il login Discord:',
                error
            );

        });

}

// =====================================================
// CHIUSURA SICURA
// =====================================================

process.on(
    'SIGINT',
    () => {

        console.log(
            '🛑 Arresto del bot...'
        );

        db.close(
            error => {

                if (error) {

                    console.error(
                        '❌ Errore chiusura database:',
                        error
                    );

                } else {

                    console.log(
                        '✅ Database chiuso correttamente.'
                    );

                }

                client.destroy();

                process.exit(0);

            }
        );

    }
);

// =====================================================
// FINE INDEX.JS
// =====================================================

console.log(
    '📦 Tutte le parti del nuovo index.js sono state caricate.'
);
