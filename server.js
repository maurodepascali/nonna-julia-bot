const express = require('express');
const axios = require('axios');
const { detectarIntencion } = require('./intents');
const kb = require('./knowledge');

const app = express();
app.use(express.json());

// ============================================
// VARIABLES DE ENTORNO (se configuran en Render)
// ============================================
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;           // vos lo inventás, ej: "nonnajulia2026"
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;       // token que da Meta
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;     // ID del número de WhatsApp
const IG_TOKEN = process.env.IG_TOKEN;                   // token de Instagram (puede ser el mismo que WhatsApp si es la misma app)

// Estado simple en memoria: quién está en medio de un pedido
// (se resetea si el servidor se reinicia — para este volumen no es problema)
const estadoUsuarios = {};

// Bug conocido de Meta: para números argentinos, el webhook entrega el número
// CON el "9" (ej: 5491121579513) pero en modo prueba la lista de autorizados
// a veces lo tiene guardado SIN el 9 (5411121579513). Si no coinciden, falla
// el envío con error 131030 aunque sea el mismo número real.
// Esta función prueba primero con el número tal cual llegó, y si Meta lo
// rechaza por "not in allowed list", reintenta sacando el 9.
function quitarNueveArgentino(numero) {
  // Formato: 549 + código de área + número (ej: 549 11 21579513)
  if (numero.startsWith('549')) {
    return '54' + numero.slice(3);
  }
  return numero;
}

// ============================================
// VERIFICACIÓN DEL WEBHOOK (Meta lo pide una sola vez al configurar)
// ============================================
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verificado correctamente');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ============================================
// RECEPCIÓN DE MENSAJES (WhatsApp + Instagram entran acá)
// ============================================
app.post('/webhook', async (req, res) => {
  res.sendStatus(200); // Le contestamos rápido a Meta, siempre 200

  try {
    const body = req.body;

    // --- WhatsApp ---
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const message = changes?.value?.messages?.[0];

      if (message && message.type === 'text') {
        const from = message.from; // número del usuario
        const texto = message.text.body;
        await manejarMensaje(texto, from, 'whatsapp');
      }
    }

    // --- Instagram ---
    if (body.object === 'instagram') {
      const entry = body.entry?.[0];
      const messaging = entry?.messaging?.[0];

      if (messaging && messaging.message && messaging.message.text) {
        const from = messaging.sender.id;
        const texto = messaging.message.text;
        await manejarMensaje(texto, from, 'instagram');
      }
    }
  } catch (err) {
    console.error('Error procesando webhook:', err.message);
  }
});

// ============================================
// LÓGICA DE RESPUESTA
// ============================================
async function manejarMensaje(texto, from, canal) {
  let respuesta;

  // Si el usuario estaba en medio de dar los datos de un pedido,
  // lo que escriba ahora se toma como esos datos y cerramos derivando.
  if (estadoUsuarios[from] === 'esperando_datos_pedido') {
    respuesta = kb.cierre_pedido;
    delete estadoUsuarios[from];
  } else {
    const intent = detectarIntencion(texto);
    respuesta = intent.respuesta;

    if (intent.nombre === 'pedido') {
      estadoUsuarios[from] = 'esperando_datos_pedido';
    }
  }

  await enviarMensaje(respuesta, from, canal);
}

// ============================================
// ENVÍO DE MENSAJES
// ============================================
async function enviarMensaje(texto, to, canal) {
  try {
    if (canal === 'whatsapp') {
      await enviarWhatsapp(texto, to);
    }

    if (canal === 'instagram') {
      await axios.post(
        `https://graph.facebook.com/v19.0/me/messages`,
        {
          recipient: { id: to },
          message: { text: texto },
        },
        { params: { access_token: IG_TOKEN } }
      );
    }
  } catch (err) {
    console.error('Error enviando mensaje:', err.response?.data || err.message);
  }
}

async function enviarWhatsapp(texto, to) {
  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        text: { body: texto },
      },
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
    );
  } catch (err) {
    const codigo = err.response?.data?.error?.code;

    // Si falla por "not in allowed list" (131030) y es un número argentino,
    // reintentamos una vez sacando el 9 extra.
    if (codigo === 131030 && to.startsWith('549')) {
      const numeroAlternativo = quitarNueveArgentino(to);
      console.log(`Reintentando envío a ${numeroAlternativo} (sin el 9)`);
      await axios.post(
        `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: numeroAlternativo,
          text: { body: texto },
        },
        { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
      );
    } else {
      throw err;
    }
  }
}

// ============================================
// HEALTH CHECK (para que Render sepa que está vivo)
// ============================================
app.get('/', (req, res) => {
  res.send('Nonna Julia Bot funcionando ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot corriendo en puerto ${PORT}`);
});