const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCodeWASync } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const chalk = require('chalk');

// DESACTIVAMOS LOS MENSAJES MOLESTOS
process.env.NODE_DEBUG = '';
console.debug = () => {};
console.trace = () => {};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    
    const conn = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        syncFullHistory: false,
        logger: { // Aquí bloqueamos todos los mensajes de baileys
            info: () => {},
            warn: () => {},
            error: () => {},
            debug: () => {}
        }
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', async (update) => {
        const { connection, qr, lastDisconnect } = update;
        
        // SOLO SE MUESTRA EL CÓDIGO
        if (qr) {
            console.log('\n\n══════════════════════════════════');
            console.log(chalk.blue.bold('📲 VINCULAR WHATSAPP - HATSUNE MIKU BOT'));
            console.log('══════════════════════════════════');
            const codigo = await makeCodeWASync(qr);
            console.log(chalk.green.bold(`🔑 TU CÓDIGO ES: ${codigo}`));
            console.log(chalk.yellow('👉 Pasos:'));
            console.log('1. Abre WhatsApp');
            console.log('2. Ve a Ajustes > Dispositivos vinculados');
            console.log('3. Toca "Vincular un dispositivo"');
            console.log('4. Escribe este código cuando te lo pida');
            console.log('══════════════════════════════════\n');
        }

        if(connection === 'open') {
            console.log(chalk.green.bold('\n✅ BOT CONECTADO Y FUNCIONANDO CORRECTAMENTE 🚀'));
            console.log('Escribe .menu en el bot para ver los comandos\n');
        }

        if(connection === 'close') {
            const deberiaReconectar = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(chalk.red('❌ Conexión cerrada, reconectando...'));
            if(deberiaReconectar) startBot();
        }
    });

    // TUS COMANDOS
    conn.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if(!msg.key.fromMe && msg.message) {
            const remitente = msg.key.remoteJid;
            const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

            if(texto.toLowerCase() === '.menu') {
                await conn.sendMessage(remitente, { 
                    text: `╭━━━━━━━━━━━━━━━━╮
┃ ✨ 𝑯𝒂𝒕𝒔𝒖𝒏𝒆 𝑴𝒊𝒌𝒖 𝑩𝒐𝒕 ✨
┃ Hecho con amor por Yoel 💖
┣━━━━━━━━━━━━━━━━┫
┃ 📋 *COMANDOS DISPONIBLES*
┃ .menu - Ver este menú
┃ .info - Información del bot
┃ .canal - Ir al canal
╰━━━━━━━━━━━━━━━━╯`
                });
            }

            if(texto.toLowerCase() === '.info') {
                await conn.sendMessage(remitente, { 
                    text: `🤖 *HATSUNE MIKU BOT*
Versión: 1.0.0
Creador: Yoel
Estado: Activo 24/7`
                });
            }
        }
    });
}

startBot();
