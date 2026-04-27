const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const settings = require("./settings")

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth")

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const jid = msg.key.remoteJid
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text

    if (!text) return

    // reaccionar con emoji
    if (settings.reactEmoji) {
      await sock.sendMessage(jid, {
        react: {
          text: settings.reactEmoji,
          key: msg.key
        }
      })
    }

    // detectar prefijo
    const usedPrefix = settings.prefix.find(p => text.startsWith(p))
    if (!usedPrefix) return

    const command = text.slice(usedPrefix.length).split(" ")[0].toLowerCase()

    // =====================
    // COMANDOS
    // =====================

    switch (command) {

      case "menu":
        await sock.sendMessage(jid, {
          image: { url: settings.menuImage },
          caption: `🌸 ${settings.botName} 🌸

╭───〔 MENÚ 〕───⬣
│ 📌 menu
│ 📌 ping
│ 📌 registro
│ 📌 sticker
│ 📌 tts
│ 📌 acertijo
│ 📌 toimg
╰────────────⬣

👑 Owner: ${settings.ownerNumber}`
        })
        break

      case "ping":
        await sock.sendMessage(jid, {
          text: "🏓 Pong!"
        })
        break

      case "registro":
        await sock.sendMessage(jid, {
          text: "📝 Usa: /reg nombre.edad"
        })
        break

      case "sticker":
        await sock.sendMessage(jid, {
          text: "🧩 En desarrollo (sticker)"
        })
        break

      case "tts":
        await sock.sendMessage(jid, {
          text: "🔊 En desarrollo (texto a voz)"
        })
        break

      case "acertijo":
        await sock.sendMessage(jid, {
          text: "🧠 ¿Qué tiene llaves pero no abre puertas?\n\nRespuesta: un piano 🎹"
        })
        break

      case "toimg":
        await sock.sendMessage(jid, {
          text: "🖼️ En desarrollo (sticker a imagen)"
        })
        break
    }
  })
}

startBot()
