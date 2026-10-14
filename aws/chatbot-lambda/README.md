# Chatbot Lambda (Claude Haiku 4.5 vía Amazon Bedrock)

Backend del chatbot del portfolio. El navegador hace `POST` a un HTTP API de API Gateway, que invoca esta Lambda, que a su vez llama a Claude en Bedrock con `ConverseCommand`.

```
AIChatbot.tsx  ──POST {messages}──▶  API Gateway (HTTP API)  ──▶  Lambda  ──▶  Bedrock (Claude Haiku 4.5)
```

## Contrato

**Request** `POST /chat`

```json
{ "messages": [{ "role": "user", "text": "Hola" }] }
```

`role` es `user` o `assistant`. La Lambda usa solo los últimos 10 mensajes, recorta cada uno a 1000 caracteres y descarta los mensajes del asistente que queden al inicio (Bedrock exige empezar con `user`).

**Response** `200`

```json
{ "text": "respuesta del modelo" }
```

Errores: `400` (body inválido), `403` (origen no permitido), `405` (método), `500` (fallo al llamar a Bedrock; el detalle queda en CloudWatch).

## Variables de entorno de la Lambda

| Variable | Ejemplo | Para qué |
|---|---|---|
| `MODEL_ID` | `us.anthropic.claude-haiku-4-5-20251001-v1:0` | Inference profile a invocar. Si no se define, usa este valor. |
| `ALLOWED_ORIGIN` | `https://tudominio.com` | Origen permitido por CORS, sin `/` final. Admite varios separados por coma (`https://tudominio.com,http://localhost:4321`). Si está vacía, la Lambda rechaza todo con `403`. |

---

## Pasos manuales en la consola de AWS

Usa la **misma región** en todos los pasos. Los ejemplos asumen `us-east-1`.

### 1. Habilitar el modelo en Bedrock

1. Consola → **Amazon Bedrock** → **Model catalog** → busca **Claude Haiku 4.5** (Anthropic).
2. Si es la primera vez que usas un modelo de Anthropic en la cuenta, Bedrock te pedirá enviar un formulario de caso de uso (**Submit use case details**). Complétalo; la aprobación suele ser casi inmediata.
3. Abre el **Playground** (Chat) con ese modelo y envía un mensaje de prueba. Si responde, la cuenta ya tiene acceso.
4. Ve a **Cross-region inference** (Inference profiles) y localiza **US Anthropic Claude Haiku 4.5**. Anota:
   - el **Inference profile ID** (`us.anthropic.claude-haiku-4-5-20251001-v1:0`), que es el `MODEL_ID`;
   - las **regiones de destino** a las que enruta (las necesitas para la policy IAM del paso 3).

> Un *inference profile* reparte las peticiones entre varias regiones de EE. UU. Por eso el permiso IAM debe cubrir el perfil **y** el modelo base en cada región de destino.

### 2. Crear la función Lambda

1. Consola → **Lambda** → **Create function** → *Author from scratch*.
   - Name: `portfolio-chatbot`
   - Runtime: **Node.js 22.x**
   - Architecture: `arm64`
   - Execution role: *Create a new role with basic Lambda permissions* (solo da permisos de logs en CloudWatch; Bedrock se añade en el paso 3).
2. Subir el código. Dos opciones:
   - **Rápida:** en el editor de la consola, borra `index.mjs`, pega el contenido de [index.mjs](index.mjs) y pulsa **Deploy**. El runtime de Node.js 22 ya incluye el AWS SDK v3.
   - **Con dependencias fijadas (recomendada a futuro):** desde esta carpeta, en PowerShell:
     ```powershell
     npm install --omit=dev
     Compress-Archive -Path index.mjs, package.json, node_modules -DestinationPath function.zip -Force
     ```
     y en la consola **Upload from → .zip file**. No subas `function.zip` al repo.
3. **Runtime settings** → Handler: `index.handler`.
4. **Configuration → General configuration** → Timeout: **30 s**. Memory: 256 MB.
5. **Configuration → Environment variables** → añade `MODEL_ID` y `ALLOWED_ORIGIN` (ver tabla de arriba).
6. Opcional pero recomendable: **Configuration → Concurrency** → *Reserved concurrency* = `2`, como tope duro de ejecuciones simultáneas.

### 3. Permiso mínimo en el rol IAM

1. En la Lambda: **Configuration → Permissions** → clic en el nombre del rol (abre IAM).
2. **Add permissions → Create inline policy → JSON** y pega esto, cambiando `ACCOUNT_ID` por tu ID de cuenta de 12 dígitos y ajustando las regiones a las que anotaste en el paso 1:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "InvokeHaikuInferenceProfile",
      "Effect": "Allow",
      "Action": "bedrock:InvokeModel",
      "Resource": "arn:aws:bedrock:us-east-1:ACCOUNT_ID:inference-profile/us.anthropic.claude-haiku-4-5-20251001-v1:0"
    },
    {
      "Sid": "InvokeHaikuFoundationModelViaProfile",
      "Effect": "Allow",
      "Action": "bedrock:InvokeModel",
      "Resource": [
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0",
        "arn:aws:bedrock:us-east-2::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0",
        "arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0"
      ],
      "Condition": {
        "StringLike": {
          "bedrock:InferenceProfileArn": "arn:aws:bedrock:us-east-1:ACCOUNT_ID:inference-profile/us.anthropic.claude-haiku-4-5-20251001-v1:0"
        }
      }
    }
  ]
}
```

3. Nómbrala `bedrock-invoke-haiku-4-5` y guarda.

Notas:
- `ConverseCommand` se autoriza con `bedrock:InvokeModel`; no hace falta `InvokeModelWithResponseStream` porque no usamos streaming.
- La `Condition` hace que el modelo base solo pueda invocarse **a través** de ese inference profile.
- El rol no debe tener `AmazonBedrockFullAccess` ni `bedrock:*`.
- Si cambias `MODEL_ID`, hay que actualizar esta policy.

**Probar la Lambda sola** (pestaña **Test**), con este evento:

```json
{
  "requestContext": { "http": { "method": "POST" } },
  "headers": { "origin": "https://tudominio.com" },
  "body": "{\"messages\":[{\"role\":\"user\",\"text\":\"¿Quién es José?\"}]}"
}
```

Debe devolver `statusCode: 200` con un `text`. Un `500` con `AccessDeniedException` en los logs significa que la policy o el acceso al modelo no están bien.

### 4. Crear el HTTP API en API Gateway con throttling

1. Consola → **API Gateway** → **Create API** → **HTTP API** → *Build*.
2. **Integrations** → *Lambda* → selecciona `portfolio-chatbot`. API name: `portfolio-chatbot-api`.
3. **Routes**: crea dos rutas hacia la misma integración:
   - `POST /chat`
   - `OPTIONS /chat` (preflight de CORS; lo responde la Lambda)
4. **Stage**: deja `$default` con *Auto-deploy* activado.
5. **CORS**: **no lo configures en API Gateway**. La Lambda ya devuelve las cabeceras CORS restringidas a `ALLOWED_ORIGIN`; si lo activas en los dos sitios, API Gateway pisa las de la Lambda.
6. **Throttling**: menú **Protect → Throttling** → stage `$default` → *Default route throttling* → **Edit**:
   - Rate limit: `2` peticiones/segundo
   - Burst limit: `5`

   Al superarlo, API Gateway responde `429` sin invocar la Lambda (no genera coste de Bedrock).
7. Copia la **Invoke URL** del stage. La URL del chat es `https://<api-id>.execute-api.us-east-1.amazonaws.com/chat`.

**Probar desde la terminal:**

```bash
curl -i -X POST "https://<api-id>.execute-api.us-east-1.amazonaws.com/chat" \
  -H "Origin: https://tudominio.com" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","text":"¿Qué stack usa José?"}]}'
```

Repite cambiando el `Origin` por otro dominio: debe responder `403`.

> CORS solo lo respeta el navegador. Alguien puede falsificar la cabecera `Origin` con `curl`, así que la protección real contra abuso es el throttling, la concurrencia reservada, `maxTokens: 400` y la alerta de presupuesto.

### 5. Alerta en AWS Budgets

1. Consola → **Billing and Cost Management** → **Budgets** → **Create budget**.
2. *Customize (advanced)* → **Cost budget**.
3. Period: **Monthly**, *Recurring*. Budgeted amount: por ejemplo `5` USD.
4. Scope: *All AWS services* (más simple y también te cubre de otros gastos inesperados).
5. Añade alertas con tu email:
   - **50 %** del presupuesto, *Actual*
   - **100 %**, *Actual*
   - **100 %**, *Forecasted* (avisa antes de llegar)
6. Crea el presupuesto y confirma el correo de suscripción si te llega.

Budgets **avisa, no corta el servicio**, y los datos de coste llegan con horas de retraso. Si recibes una alerta, la forma rápida de parar el gasto es poner *Reserved concurrency* = `0` en la Lambda.

### 6. Conectar el frontend

1. En el `.env` de la raíz del proyecto:
   ```
   PUBLIC_CHAT_API_URL=https://<api-id>.execute-api.us-east-1.amazonaws.com/chat
   ```
2. Define la misma variable en tu hosting (se lee en tiempo de build) y vuelve a desplegar el sitio.
3. Para probar en local con `npm run dev`, añade `http://localhost:4321` a `ALLOWED_ORIGIN` y quítalo cuando termines.
4. Revoca la API key antigua de Gemini en Google AI Studio: estuvo incluida en el JavaScript público del sitio.
