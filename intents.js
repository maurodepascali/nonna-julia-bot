const kb = require('./knowledge');

// Normaliza texto: minúsculas, sin tildes, sin signos raros
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // saca tildes
    .replace(/[^\w\s]/g, ' ') // saca signos de puntuación
    .trim();
}

// Cada intención tiene una lista de palabras/frases clave.
// Si el mensaje del usuario contiene alguna, matchea esa intención.
const INTENTS = [
  {
    nombre: 'saludo',
    keywords: ['hola', 'buenas', 'buen dia', 'buenas tardes', 'buenas noches', 'hey', 'menu', 'inicio'],
    respuesta: kb.saludo,
  },
  // mayorista va ANTES que catalogo: si el mensaje menciona "mayorista"
  // junto con "precio", queremos que gane la respuesta mayorista, no la minorista.
  {
    nombre: 'mayorista',
    keywords: ['mayorista', 'mayoreo', 'revendedor', 'confiteria', 'cafeteria', 'comercio', 'reventa', '2'],
    respuesta: kb.mayorista,
  },
  {
    nombre: 'catalogo',
    keywords: ['catalogo', 'precio', 'precios', 'cuanto sale', 'cuanto cuesta', 'menu', 'productos', 'sabores', 'chipa clasico', 'relleno', 'pan de chipa', '1', 'opcion 1'],
    respuesta: kb.catalogo,
  },
  {
    nombre: 'envios',
    keywords: ['envio', 'envios', 'mandan', 'llega', 'zona', 'caba', 'provincia', 'delivery', 'te queda', 'reparto', '3'],
    respuesta: kb.envios,
  },
  {
    nombre: 'retiro',
    keywords: ['retiro', 'retirar', 'paso a buscar', 'busco yo', '4'],
    respuesta: kb.retiro,
  },
  {
    nombre: 'ubicacion',
    keywords: ['donde estan', 'donde queda', 'local', 'direccion', 'ubicacion', 'donde es'],
    respuesta: kb.ubicacion,
  },
  {
    nombre: 'pagos',
    keywords: ['pago', 'pagos', 'transferencia', 'mercado pago', 'mercadopago', 'efectivo', 'como pago', '5'],
    respuesta: kb.pagos,
  },
  {
    nombre: 'tiempos',
    keywords: ['tiempo', 'demora', 'cuando llega', 'anticipacion', 'con cuanto', 'hoy', 'para mañana', 'para hoy', 'cuando tengo que pedir', 'con cuantos dias', 'con que anticipacion'],
    respuesta: kb.tiempos,
  },
  {
    nombre: 'pedido',
    keywords: ['quiero pedir', 'hacer un pedido', 'quiero comprar', 'me interesa', 'quisiera pedir', 'quiero encargar', '6'],
    respuesta: kb.inicio_pedido,
  },
];

// Palabras que indican que el mensaje es "raro"/complejo y hay que derivar directo
const DERIVAR_DIRECTO = ['reclamo', 'problema', 'queja', 'no llego', 'mal estado', 'factura', 'urgente', 'hablar con alguien', 'persona real'];

function detectarIntencion(mensajeUsuario) {
  const texto = normalizar(mensajeUsuario);

  // Si pide explícitamente hablar con una persona, o es un reclamo -> derivar directo
  for (const palabra of DERIVAR_DIRECTO) {
    if (texto.includes(palabra)) {
      return { nombre: 'derivar', respuesta: kb.derivar_humano };
    }
  }

  for (const intent of INTENTS) {
    for (const kw of intent.keywords) {
      if (texto.includes(kw)) {
        return intent;
      }
    }
  }

  // No matcheó nada -> derivar a humano
  return { nombre: 'derivar', respuesta: kb.derivar_humano };
}

module.exports = { detectarIntencion, normalizar };
