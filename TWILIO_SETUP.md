# 📱 Configuración de WhatsApp Business API con Twilio

## 🚀 Paso 1: Crear cuenta en Twilio

1. Ve a: **https://www.twilio.com/try-twilio**
2. Regístrate con tu correo electrónico
3. Verifica tu número de teléfono
4. Completa el formulario inicial (selecciona "Messaging" como objetivo)

## 🔑 Paso 2: Obtener credenciales

1. En el **Dashboard de Twilio**: https://console.twilio.com/
2. Copia los siguientes datos:
   - **Account SID** (ejemplo: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
   - **Auth Token** (haz clic en "Show" para verlo)

## 📞 Paso 3: Activar WhatsApp Sandbox (Para pruebas)

### Modo Sandbox (Gratis - Solo para pruebas):
1. Ve a: **Messaging → Try it out → Send a WhatsApp message**
2. Verás un número de prueba (ej: +1 415 523 8886)
3. **Importante**: Cada encargado debe enviar un mensaje de activación:
   - Agregar el número de Twilio a WhatsApp
   - Enviar el código de activación (ej: "join <palabra-clave>")
   - Ejemplo: `join excited-tiger`

### Producción (Requiere aprobación):
1. Ve a: **Messaging → Senders → WhatsApp senders**
2. Solicita un número dedicado de WhatsApp
3. Envía tu solicitud de negocio (requiere Meta Business Manager)
4. Espera aprobación (1-2 semanas)

## ⚙️ Paso 4: Configurar en tu proyecto

Edita el archivo `.env` en tu proyecto:

```env
# Twilio WhatsApp Business API
TWILIO_ACCOUNT_SID=tu_account_sid_aqui
TWILIO_AUTH_TOKEN=tu_auth_token_aqui
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Reemplaza:**
- `tu_account_sid_aqui` con tu Account SID real
- `tu_auth_token_aqui` con tu Auth Token real
- `+14155238886` con tu número de WhatsApp de Twilio

## 🧪 Paso 5: Probar el envío

1. **Reinicia el servidor backend:**
   ```bash
   cd RegEstudiantes
   node src/index.js
   ```

2. **Activa el Sandbox WhatsApp:**
   - Los encargados deben enviar el mensaje de activación
   - Ejemplo: Agregar `+1 415 523 8886` y enviar `join excited-tiger`

3. **Prueba desde Panel del Día:**
   - Ve a Panel del Día en reportes_academicos
   - Haz clic en el botón de WhatsApp junto a un ausente
   - El mensaje se enviará al encargado registrado

## 📊 Paso 6: Crear tabla de logs (Opcional)

Ejecuta en Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT REFERENCES students(id),
    telefono TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    twilio_sid TEXT,
    status TEXT,
    fecha_envio TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_logs_student ON whatsapp_logs(student_id);
CREATE INDEX idx_whatsapp_logs_fecha ON whatsapp_logs(fecha_envio);
```

## 💰 Costos y Límites

### Sandbox (Modo Prueba):
- **100% GRATIS**
- Máximo 5 números activos simultáneamente
- Los números deben reactivarse cada 3 días
- Solo para desarrollo/pruebas

### Producción:
- **Primeras 1,000 conversaciones/mes: GRATIS**
- Conversaciones adicionales: ~$0.016 USD (~Q0.12)
- Una conversación = ventana de 24 horas

## 🔄 Modo Simulación

Si NO configuras las credenciales de Twilio, el sistema funciona en **modo simulación**:
- Los mensajes se registran en consola
- No se envían WhatsApps reales
- Útil para desarrollo sin gastar créditos

## 📝 Plantillas de Mensajes (Producción)

Para producción, debes crear plantillas aprobadas por Meta:

1. Ve a: **Messaging → Content Editor → WhatsApp → Create new Template**
2. Crea plantilla, ejemplo:
   ```
   Nombre: student_absence_alert
   Categoría: UTILITY
   Idioma: Spanish (es)
   
   Contenido:
   Hola {{1}}, le informamos que {{2}} no asistió a clases el día {{3}}.
   Jornada: {{4}}, Grado: {{5}}.
   ```
3. Envía para aprobación de Meta (24-48 horas)

## 🆘 Solución de Problemas

### Error: "Unverified number"
- El número del encargado no activó el Sandbox
- Debe enviar el mensaje de activación primero

### Error: "Twilio not configured"
- Verifica que las variables estén en `.env`
- Reinicia el servidor después de editar `.env`

### Error: "Invalid phone number"
- Asegúrate de que el número tenga formato correcto
- Guatemala: 8 dígitos → se convierte automáticamente a +502XXXXXXXX

## ✅ Verificación Final

Revisa que todo esté configurado:
- [ ] Cuenta de Twilio creada
- [ ] Account SID y Auth Token obtenidos
- [ ] Variables en `.env` configuradas
- [ ] Sandbox activado (o número de producción aprobado)
- [ ] Encargados activaron el Sandbox con mensaje de código
- [ ] Servidor backend reiniciado
- [ ] Prueba de envío exitosa desde Panel del Día

## 📚 Documentación Oficial

- **Twilio WhatsApp Quickstart**: https://www.twilio.com/docs/whatsapp/quickstart
- **WhatsApp Sandbox**: https://www.twilio.com/docs/whatsapp/sandbox
- **Message Templates**: https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates
- **Pricing**: https://www.twilio.com/whatsapp/pricing

---

¿Necesitas ayuda? Contacta a soporte de Twilio: https://support.twilio.com/
