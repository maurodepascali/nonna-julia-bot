# Nonna Julia — Bot de WhatsApp e Instagram

Bot automático 100% gratuito que responde preguntas frecuentes (catálogo, precios,
envíos, retiro, pagos, tiempos) y deriva a un humano cuando hace falta.

---

## 1. Qué vas a necesitar (todo gratis)

- [ ] Cuenta en **Meta for Developers** (developers.facebook.com) con tu Facebook
- [ ] Página de Facebook de Nonna Julia conectada
- [ ] Cuenta de Instagram profesional (Business) vinculada a esa página
- [ ] Cuenta en **Render.com** (gratis, podés entrar con GitHub)
- [ ] Cuenta en **GitHub** (gratis, para subir este código)

---

## 2. Configurar Meta for Developers

1. Entrá a **developers.facebook.com** → "Mis apps" → "Crear app" → tipo **"Otro"** → **"Empresa"**
2. Ponele nombre, ej: `Nonna Julia Bot`
3. En el dashboard de la app, buscá el producto **WhatsApp** → "Configurar"
4. Ahí vas a ver:
   - **Temporary access token** (token de acceso temporal) → lo vamos a usar como `WHATSAPP_TOKEN`
   - **Phone number ID** → lo vamos a usar como `PHONE_NUMBER_ID`
5. Para conectar tu número real de WhatsApp Business (no el de prueba): en la misma sección hay un botón para agregar tu número. Vas a tener que verificarlo con un código por SMS.
6. Para Instagram: en el dashboard, agregá el producto **"Instagram"** y seguí el asistente para vincular tu cuenta de Instagram profesional (tiene que estar conectada a la misma página de Facebook).

> ⚠️ El "Temporary access token" dura 24hs. Para producción hay que generar un
> **token permanente** (system user token). Cuando lleguemos a esa parte, decime
> y te guío — es un paso más pero también gratis.

---

## 3. Subir el código a GitHub

```bash
cd nonna-julia-bot
git init
git add .
git commit -m "Bot inicial Nonna Julia"
```

Creá un repo nuevo en GitHub (puede ser privado) y subilo:

```bash
git remote add origin https://github.com/TU_USUARIO/nonna-julia-bot.git
git push -u origin main
```

---

## 4. Desplegar en Render (gratis)

1. Entrá a **render.com** → "New" → "Web Service"
2. Conectá tu repo de GitHub `nonna-julia-bot`
3. Configuración:
   - **Build command**: `npm install`
   - **Start command**: `npm start`
   - **Plan**: Free
4. En "Environment Variables" agregá estas 4:

| Variable | Valor |
|---|---|
| `VERIFY_TOKEN` | Inventá cualquier palabra, ej: `nonnajulia2026` |
| `WHATSAPP_TOKEN` | El token que copiaste de Meta |
| `PHONE_NUMBER_ID` | El ID que copiaste de Meta |
| `IG_TOKEN` | Token de Instagram (puede ser el mismo que WhatsApp si es la misma app) |

5. Click en "Create Web Service". Render te va a dar una URL tipo:
   `https://nonna-julia-bot.onrender.com`

> 💡 Nota sobre el plan free de Render: el servidor "se duerme" después de 15
> minutos sin uso, y tarda ~30 segundos en despertar con el primer mensaje que
> llega. Para este volumen de consultas no es un problema real. Si en el futuro
> se vuelve molesto, existen formas gratuitas de mantenerlo despierto (te ayudo
> cuando llegue el momento).

---

## 5. Conectar el webhook en Meta

1. Volvé a developers.facebook.com → tu app → WhatsApp → "Configuration"
2. En "Webhook" pegá:
   - **Callback URL**: `https://nonna-julia-bot.onrender.com/webhook`
   - **Verify token**: el mismo que pusiste en `VERIFY_TOKEN` en Render
3. Click "Verify and save" (si todo está bien conectado, va a decir ✅)
4. Suscribite al campo **messages**
5. Repetí el mismo paso en la sección de Instagram

---

## 6. Probar

Mandale un WhatsApp a tu número de prueba (o al real, una vez conectado) diciendo
"hola" y debería responderte el menú automáticamente.

---

## 7. Cómo editar las respuestas

Todo el contenido de lo que dice el bot (precios, zonas, textos) está en:

```
src/knowledge.js
```

Es texto plano, no hace falta saber programar para editarlo — cambiás el texto,
guardás, hacés `git push`, y Render actualiza el bot solo en un par de minutos.

Para agregar o ajustar qué palabras activan cada respuesta, el archivo es:

```
src/intents.js
```

---

## Qué hace y qué no hace este bot (por ahora)

✅ Responde catálogo, precios minorista y mayorista, envíos, retiro, pagos, tiempos
✅ Detecta cuando alguien quiere hacer un pedido y pide los datos
✅ Si no entiende algo, avisa que en breve responde una persona
❌ No cobra ni gestiona pagos automáticamente (los pedidos se cierran a mano)
❌ No tiene inteligencia artificial generativa (respuestas fijas por palabras clave) —
   esto es lo que lo mantiene 100% gratis. Si en algún momento querés que entienda
   mensajes más complejos o raros, se puede sumar IA, pero ahí sí empieza a tener
   un costo pequeño por uso.
