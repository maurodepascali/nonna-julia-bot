const kb = require('./knowledge');

// Normaliza texto: minúsculas, sin tildes, sin signos raros
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // saca tildes
    .replace(/[^\w\s]/g, ' ') // saca signos de puntuación
    .trim();
}

// Opciones numéricas del menú: SOLO matchean si el mensaje es exactamente
// ese número (no si el número aparece en cualquier parte del texto — así
// evitamos falsos positivos con teléfonos, horarios, cantidades, etc.)
const OPCIONES_NUMERICAS = {
  '1': 'catalogo',
  '2': 'mayorista',
  '3': 'envios',
  '4': 'retiro',
  '5': 'pagos',
  '6': 'pedido',
};

// Cada intención tiene una lista de palabras/frases clave.
// Si el mensaje del usuario contiene alguna, matchea esa intención.
const INTENTS = [
  {
    nombre: 'saludo',
    keywords: ['hola', 'buenas', 'buen dia', 'buenas tardes', 'buenas noches', 'hey', 'menu', 'inicio', 'volver', 'opciones', 'menu principal'],
    respuesta: kb.saludo,
  },
  // mayorista va ANTES que catalogo: si el mensaje menciona "mayorista"
  // junto con "precio", queremos que gane la respuesta mayorista, no la minorista.
  {
    nombre: 'mayorista',
    keywords: ['mayorista', 'mayoreo', 'revendedor', 'confiteria', 'cafeteria', 'comercio', 'reventa'],
    respuesta: kb.mayorista,
  },
  {
    nombre: 'tacc',
    keywords: ['sin tacc', 'celiaco', 'celiaca', 'gluten', 'apto celiacos', 'libre de gluten'],
    respuesta: kb.tacc,
  },
  {
    nombre: 'catalogo',
    keywords: ['catalogo', 'precio', 'precios', 'cuanto sale', 'cuanto cuesta', 'sabores', 'chipa clasico', 'chipa relleno', 'relleno', 'pan de chipa'],
    respuesta: kb.catalogo,
  },
  {
    nombre: 'envios',
    keywords: ['envio', 'envios', 'mandan', 'llega', 'zona', 'caba', 'provincia', 'delivery', 'te queda', 'reparto'],
    respuesta: kb.envios,
  },
  {
    nombre: 'retiro',
    keywords: ['retiro', 'retirar', 'paso a buscar', 'busco yo'],
    respuesta: kb.retiro,
  },
  {
    nombre: 'ubicacion',
    keywords: ['donde estan', 'donde queda', 'local', 'direccion', 'ubicacion', 'donde es'],
    respuesta: kb.ubicacion,
  },
  {
    nombre: 'pagos',
    keywords: ['pago', 'pagos', 'transferencia', 'mercado pago', 'mercadopago', 'efectivo', 'como pago'],
    respuesta: kb.pagos,
  },
  {
    nombre: 'tiempos',
    keywords: ['tiempo', 'demora', 'cuando llega', 'anticipacion', 'con cuanto', 'para mañana', 'para hoy', 'cuando tengo que pedir', 'con cuantos dias', 'con que anticipacion'],
    respuesta: kb.tiempos,
  },
  {
    nombre: 'duracion',
    keywords: ['dura', 'duracion', 'freezer', 'congelado cuanto', 'vencimiento', 'fecha de vencimiento', 'cuanto aguanta', 'se puede congelar'],
    respuesta: kb.duracion,
  },
  {
    nombre: 'pedido_minimo',
    keywords: ['pedido minimo', 'minimo de compra', 'cantidad minima', 'puedo pedir poco', 'hay minimo'],
    respuesta: kb.pedido_minimo,
  },
  {
    nombre: 'pedido',
    keywords: ['quiero pedir', 'hacer un pedido', 'quiero comprar', 'me interesa', 'quisiera pedir', 'quiero encargar'],
    respuesta: kb.inicio_pedido,
  },
];

// Palabras que indican que el mensaje es un reclamo o pide explícitamente
// hablar con una persona -> derivar directo, sin importar el contexto.
const DERIVAR_DIRECTO = ['reclamo', 'problema', 'queja', 'no llego', 'mal estado', 'factura', 'urgente', 'hablar con alguien', 'persona real'];

function detectarIntencion(mensajeUsuario) {
  const texto = normalizar(mensajeUsuario);

  // 1) Opción numérica exacta del menú (ej: escribió solo "2")
  if (OPCIONES_NUMERICAS[texto]) {
    const nombreIntent = OPCIONES_NUMERICAS[texto];
    const intent = INTENTS.find((i) => i.nombre === nombreIntent);
    if (intent) return intent;
  }

  // 2) Reclamo o pedido explícito de hablar con una persona -> derivar directo
  for (const palabra of DERIVAR_DIRECTO) {
    if (texto.includes(palabra)) {
      return { nombre: 'derivar', respuesta: kb.derivar_humano };
    }
  }

  // 3) Palabras clave normales
  for (const intent of INTENTS) {
    for (const kw of intent.keywords) {
      if (texto.includes(kw)) {
        return intent;
      }
    }
  }

  // 4) No matcheó nada. Esto es distinto de "derivar": acá todavía no
  // sabemos si hay que derivar o si es información de un pedido en curso
  // (eso lo decide server.js según el contexto de la conversación).
  return { nombre: 'sin_match', respuesta: kb.derivar_humano };
}

module.exports = { detectarIntencion, normalizar };
