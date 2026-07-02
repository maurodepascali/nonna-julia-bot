const express = require('express');
const axios = require('axios');
const { detectarIntencion } = require('./intents');
const kb = require('./knowledge');
const imagenes = require('./knowledge').imagenes;

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

// Recuerda si la última respuesta relevante fue catálogo o mayorista, para que
// si la persona después escribe algo que no reconocemos (ej: "Palermo", una
// cantidad, un día), lo tratemos como el inicio de un pedido en vez de
// derivar directo a un humano.
const ultimoInteres = {};

// Se agrega al final de las respuestas informativas, para que la persona
// siempre sepa cómo volver a ver las opciones.
const FOOTER_MENU = '\n\n📲 Escribí *menu* para volver a las opciones.';
const INTENTS_CON_FOOTER = ['catalogo', 'mayorista', 'envios', 'retiro', 'ubicacion', 'pagos', 'tiempos', 'duracion', 'pedido_minimo', 'tacc'];

// Intents que, si la persona los vio último, hacen que un mensaje "sin_match"
// se interprete como el arranque de un pedido en vez de un fallback genérico.
const INTENTS_DE_INTERES = ['catalogo', 'mayorista'];

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
  const intent = detectarIntencion(texto);

  // Si el usuario quiere volver al menú (escribe "menu", "volver", "hola", etc.)
  // eso SIEMPRE gana, incluso si estaba en medio de dar los datos de un pedido.
  // Así nadie queda "atrapado" en un flujo si se arrepiente o se equivocó.
  if (intent.nombre === 'saludo') {
    delete estadoUsuarios[from];
    delete ultimoInteres[from];
    await enviarMensaje(intent.respuesta, from, canal);
    return;
  }

  let respuesta;
  let imageUrl = null;

  if (estadoUsuarios[from] === 'esperando_datos_pedido') {
    // Estaba en medio de dar los datos de un pedido -> lo que escriba ahora
    // se toma como esos datos y cerramos confirmando.
    respuesta = kb.cierre_pedido;
    delete estadoUsuarios[from];
    delete ultimoInteres[from];
  } else if (intent.nombre === 'sin_match' && INTENTS_DE_INTERES.includes(ultimoInteres[from])) {
    // No reconocimos el mensaje, PERO la persona recién había mirado catálogo
    // o mayorista — lo más probable es que esté contestando con su zona,
    // cantidad o algo similar. En vez de derivar directo, le pedimos los
    // datos del pedido, igual que si hubiese elegido la opción 6.
    respuesta = kb.inicio_pedido;
    estadoUsuarios[from] = 'esperando_datos_pedido';
    delete ultimoInteres[from];
  } else {
    respuesta = intent.respuesta;
    imageUrl = imagenes[intent.nombre] || null; // solo catalogo y mayorista tienen imagen cargada

    if (INTENTS_CON_FOOTER.includes(intent.nombre)) {
      respuesta += FOOTER_MENU;
    }

    if (intent.nombre === 'pedido') {
      estadoUsuarios[from] = 'esperando_datos_pedido';
    }

    if (INTENTS_DE_INTERES.includes(intent.nombre)) {
      ultimoInteres[from] = intent.nombre;
    } else {
      delete ultimoInteres[from];
    }
  }

  await enviarMensaje(respuesta, from, canal, { imageUrl });
}

// ============================================
// ENVÍO DE MENSAJES
// ============================================
async function enviarMensaje(texto, to, canal, opts = {}) {
  try {
    if (canal === 'whatsapp') {
      await enviarWhatsapp(to, texto, opts.imageUrl);
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

function construirPayloadWhatsapp(to, texto, imageUrl) {
  if (imageUrl) {
    // Mensaje con imagen: el texto va como "caption" debajo de la foto
    return {
      messaging_product: 'whatsapp',
      to,
      type: 'image',
      image: { link: imageUrl, caption: texto },
    };
  }
  return {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: texto },
  };
}

async function enviarWhatsapp(to, texto, imageUrl) {
  const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;
  const headers = { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } };

  try {
    await axios.post(url, construirPayloadWhatsapp(to, texto, imageUrl), headers);
  } catch (err) {
    const codigo = err.response?.data?.error?.code;

    // Si falla por "not in allowed list" (131030) y es un número argentino,
    // reintentamos una vez sacando el 9 extra.
    if (codigo === 131030 && to.startsWith('549')) {
      const numeroAlternativo = quitarNueveArgentino(to);
      console.log(`Reintentando envío a ${numeroAlternativo} (sin el 9)`);
      await axios.post(url, construirPayloadWhatsapp(numeroAlternativo, texto, imageUrl), headers);
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
