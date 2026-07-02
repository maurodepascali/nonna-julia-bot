// ============================================
// BASE DE CONOCIMIENTO - NONNA JULIA BOT
// Editá este archivo para actualizar precios, zonas, etc.
// No hace falta tocar el resto del código.
// ============================================

module.exports = {

  // --- SALUDO / MENÚ PRINCIPAL ---
  saludo: `¡Hola! 👋 Bienvenido a *Nonna Julia* 🧡
Chipás artesanales congelados, con la receta de la abuela.

Puedo ayudarte con:
1️⃣ Catálogo minorista
2️⃣ Catálogo mayorista
3️⃣ Envíos y zonas
4️⃣ Retiro
5️⃣ Formas de pago
6️⃣ Hacer un pedido

Escribime el número o directamente contame qué necesitás 😊`,

  // --- CATÁLOGO MINORISTA ---
  catalogo: `🧡 *Catálogo Nonna Julia*

*Chipá Clásico*
• 250g: $8.000
• 500g: $14.000
• 1kg: $26.000

*Chipá Relleno* (unidad $2.800)
Sabores: panceta y cheddar, roquefort, hongos, jamón y queso, carne y provoleta

*Pan de Chipá*: $3.000 la unidad

Todo artesanal, sin conservantes, receta de la abuela Julia 👵🧡

¿Querés hacer un pedido?`,

  // --- PRECIOS MAYORISTA ---
  mayorista: `🧡 *Precios Mayorista*

• Pack Chipá Clásico: $20.000
• Pack Chipá Relleno: $25.000
• Pack Pan de Chipá: $18.000

📋 *Condiciones*
• Pedido mínimo: 3kg (podés armar surtido, mínimo 1kg por variedad)
• Con 72hs de anticipación
• Seña del 50% para confirmar el pedido, saldo al momento de la entrega

También tenemos un pack de degustación por $14.000 — incluye chipá clásico, los 5 sabores rellenos y pan de chipá. El envío es sin cargo. Y si después hacés un pedido mayorista, esos $14.000 se descuentan del total 😊

Indicame de qué zona sos y coordinamos 😊`,

  // --- ENVÍOS ---
  envios: `🚚 *Envíos*

*CABA*: a coordinar día y horario.

*Provincia*: consultanos tu zona 😊

💰 *Costo de envío*
• Minorista: GRATIS a partir de $20.000 — sino $3.000
• Mayorista: GRATIS a partir de $100.000 — sino, consultamos si aplica costo según el pedido

¿Me contás tu zona para confirmarte?`,

  // --- RETIRO ---
  retiro: `📍 No tenemos local físico, pero podés retirar tu pedido por *Parque Chacabuco* o *Palermo*, coordinando día y horario con nosotros.`,

  // --- UBICACIÓN (mismo texto que retiro, la gente suele preguntar "dónde están") ---
  ubicacion: `📍 No tenemos local físico. Elaboramos de forma artesanal y podés retirar por *Parque Chacabuco* o *Palermo* (a coordinar), o coordinamos envío según tu zona 🚚`,

  // --- PAGOS ---
  pagos: `💳 *Formas de pago*

• Transferencia bancaria
• MercadoPago
• Efectivo

Alias: *nonna.julia*`,

  // --- TIEMPOS ---
  tiempos: `⏰ *Tiempos de pedido*

• Pedidos minoristas: con 24hs de anticipación
• Pedidos mayoristas: con 48/72hs de anticipación

Así nos aseguramos de que todo llegue fresco y recién elaborado 🧡`,

  // --- DURACIÓN EN FREEZER ---
  duracion: `🧊 El chipá dura entre *4 y 6 meses* en el freezer sin perder calidad. Conservalo bien cerrado y listo para cuando lo necesites 🧡`,

  // --- PEDIDO MÍNIMO MINORISTA ---
  pedido_minimo: `No hay un mínimo de compra pero según la cantidad se puede aplicar costo de envío.

El envío sin cargo es a partir de $20.000 — sino, el costo es de $3.000 📦`,

  // --- SIN TACC / CELÍACOS ---
  tacc: `🌾 Los productos son sin TACC, pero puede existir contaminación cruzada — no podemos garantizar que sea 100% libre de gluten.`,

  // --- INICIO DE TOMA DE PEDIDO ---
  inicio_pedido: `¡Buenísimo! 📝 Contame:

• ¿Qué productos y cantidades querés?
• ¿Zona de entrega o retirás vos?
• ¿Para qué día lo necesitás?

Con esos datos te confirmo disponibilidad y el total 🧡`,

  // --- DERIVAR A HUMANO ---
  derivar_humano: `Gracias por escribirnos 🧡 En breve te responde alguien del equipo para ayudarte con eso puntualmente.
Si querés ver las opciones de nuevo, escribí *menu*.`,

  // --- CIERRE PEDIDO (después de que dieron los datos) ---
  cierre_pedido: `¡Recibido! ✅ En breve alguien del equipo te confirma disponibilidad, total y coordinamos entrega/retiro. Gracias por elegir Nonna Julia 🧡`,
};

// ============================================
// IMÁGENES (opcional)
// Pegá acá el link DIRECTO a cada imagen (tiene que terminar en .jpg/.png/.webp,
// no un link a Instagram ni a una carpeta de Drive). Si lo dejás vacío (''),
// el bot manda solo texto como hasta ahora, sin romperse.
// ============================================
module.exports.imagenes = {
  catalogo: 'https://raw.githubusercontent.com/maurodepascali/nonna-julia-bot/main/minorista052026.png',
  mayorista: 'https://raw.githubusercontent.com/maurodepascali/nonna-julia-bot/main/mayorista052026.png',
};