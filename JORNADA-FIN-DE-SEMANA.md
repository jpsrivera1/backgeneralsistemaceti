# Jornada "Fin de Semana" - Documentación

## 📅 Fecha de Implementación
25 de febrero de 2026  
**Actualización de validación de días**: 25 de febrero de 2026

## 🎯 Objetivo
Agregar una nueva jornada "Fin de semana" al sistema de control académico para estudiantes y docentes que solo asisten los domingos, con validación automática del día de la semana.

## 📋 Características de la Jornada

### Para Estudiantes
- **Días de asistencia**: Solo domingos
- **Horario de entrada**:
  - ✅ **A TIEMPO**: Antes de las 7:00 AM
  - ⚠️ **TARDE**: Entre 7:00 AM y 7:59 AM
  - ❌ **AUSENTE**: A partir de las 8:00 AM

### Para Docentes
- **Días de asistencia**: Solo domingos
- **Horario de entrada**:
  - ✅ **A TIEMPO**: Antes de las 6:50 AM
  - ⚠️ **TARDE**: A partir de las 6:50 AM

## 🔧 Cambios Implementados

### Backend (RegEstudiantes)

#### 1. **src/controllers/docentes.controller.js**
```javascript
// Línea 14: Validación actualizada
if (!['Matutina', 'Vespertina', 'Fin de semana'].includes(jornada)) {
  return res.status(400).json({
    ok: false,
    mensaje: 'Jornada debe ser Matutina, Vespertina o Fin de semana'
  });
}
```

#### 2. **src/controllers/asistencias.controller.js**

**Para Estudiantes (líneas 259-291):**
```javascript
} else if (estudiante.jornada === 'Fin de semana') {
    // Jornada Fin de semana (solo domingos): A_TIEMPO < 7:00, TARDE 7:00-7:59, AUSENTE ≥ 8:00
    const limiteATiempo = 7 * 60; // 7:00 AM = 420 minutos
    const limiteAusente = 8 * 60; // 8:00 AM = 480 minutos
    
    if (minutosDesdeMedianoche < limiteATiempo) {
        estadoAsistencia = 'A_TIEMPO';
    } else if (minutosDesdeMedianoche < limiteAusente) {
        estadoAsistencia = 'TARDE';
    } else {
        estadoAsistencia = 'AUSENTE';
    }
}
```

**Para Docentes (líneas 330-345):**
```javascript
} else if (docente.jornada === 'Fin de semana') {
    limite = 6 * 60 + 50; // 6:50 AM en minutos (410 minutos)
}
```

**Validación de Día de la Semana (NUEVA - 25 feb 2026):**
```javascript
// Nueva función helper
const getGuatemalaDayOfWeek = () => {
    return getGuatemalaDate().getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
};

// Para Estudiantes (antes de calcular estado):
const diaActual = getGuatemalaDayOfWeek();

if (estudiante.jornada === 'Matutina' || estudiante.jornada === 'Vespertina') {
    // Solo lunes a viernes (1-5)
    if (diaActual === 0 || diaActual === 6) {
        return res.status(400).json({
            error: `La jornada ${estudiante.jornada} no tiene clases los ${diaActual === 0 ? 'domingos' : 'sábados'}`
        });
    }
} else if (estudiante.jornada === 'Fin de semana') {
    // Solo domingos (0)
    if (diaActual !== 0) {
        return res.status(400).json({
            error: `La jornada Fin de semana solo tiene clases los domingos`
        });
    }
}

// Para Docentes: Misma validación antes de registrar entrada
```

### Frontend - reportes_academicos

#### 3. **src/pages/RegistrarDocente.jsx**
```jsx
// Formulario de registro - Select de jornada
<option value="Matutina">Matutina</option>
<option value="Vespertina">Vespertina</option>
<option value="Fin de semana">Fin de semana</option>
```

#### 4. **src/pages/ListaDocentes.jsx**
```jsx
// Filtro de jornada
<option value="Fin de semana">Fin de semana</option>

// Función para mostrar ícono
const getJornadaIcon = (jornada) => {
  if (jornada === 'Matutina') {
    return <i className="bi bi-sun-fill text-yellow-500"></i>;
  } else if (jornada === 'Vespertina') {
    return <i className="bi bi-moon-fill text-indigo-500"></i>;
  } else if (jornada === 'Fin de semana') {
    return <i className="bi bi-calendar-week text-green-500"></i>;
  }
  return null;
};
```

### Frontend - FrontRegEstudiantes

#### 5. **src/pages/RegistrarDocente.jsx**
- Misma actualización que reportes_academicos

#### 6. **src/pages/ListaDocentes.jsx**
- Misma actualización que reportes_academicos

### Frontend - admin-panel

**No requiere modificaciones**: El componente `TeacherReports.tsx` maneja jornadas dinámicamente, por lo que automáticamente incluirá "Fin de semana" cuando haya docentes con esa jornada.

## 📊 Resumen de Horarios por Jornada

| Jornada | Estudiantes A_TIEMPO | Docentes A_TIEMPO | Días |
|---------|---------------------|-------------------|------|
| **Matutina** | ≤ 7:20 AM | < 7:00 AM | Lunes-Viernes |
| **Vespertina** | ≤ 13:20 PM | < 13:10 PM | Lunes-Viernes |
| **Fin de semana** | < 7:00 AM | < 6:50 AM | Solo Domingos |

## 🚀 Commits y Despliegue

### Backend
- **Repo**: backgeneralsistemaceti
- **Commit inicial**: `c102dae` + documentación `67b888d`
- **Commit validación de días**: `54ebe8a`
- **Mensajes**: 
  - "feat: Agregar jornada 'Fin de semana' - Asistencias solo domingos, estudiantes antes 7:00, docentes antes 6:50"
  - "feat: Validar automáticamente día de semana según jornada - Matutina/Vespertina lun-vie, Fin de semana solo dom"

### Frontend - reportes_academicos
- **Repo**: controlacademico
- **Commit**: `becff94`
- **Mensaje**: "feat: Agregar opción jornada 'Fin de semana' en registro y filtros de docentes"

### Frontend - FrontRegEstudiantes
- **Repo**: registrosceti
- **Commit**: `51dff58`
- **Mensaje**: "feat: Agregar opción jornada 'Fin de semana' en registro y filtros de docentes"

## ✅ Verificación Post-Implementación

### Pasos para probar:

#### 1. **Registrar un docente de "Fin de semana"**:
   - Ir a cualquier frontend → Docentes → Registrar Docente
   - Seleccionar jornada "Fin de semana"
   - Guardar

#### 2. **Verificar asistencia en domingo**:
   - Marcar tarjeta NFC un domingo antes de 6:50 AM → Debe registrar "A_TIEMPO"
   - Marcar tarjeta NFC un domingo después de 6:50 AM → Debe registrar "TARDE"

#### 3. **Verificar validación de día (NUEVO)**:
   - **Jornada Matutina/Vespertina en fin de semana**:
     - Intentar marcar asistencia un sábado o domingo → Debe rechazar con mensaje de error
     - Mensaje esperado: "La jornada [X] no tiene clases los domingos/sábados"
   
   - **Jornada Fin de semana en día de semana**:
     - Intentar marcar asistencia de lunes a sábado → Debe rechazar con mensaje de error
     - Mensaje esperado: "La jornada Fin de semana solo tiene clases los domingos. Hoy es [día]"

#### 4. **Verificar filtros**:
   - Lista de Docentes → Filtro Jornada → Debe aparecer "Fin de semana"

#### 5. **Verificar reportes**:
   - admin-panel → Reportes Docentes → Los docentes de "Fin de semana" deben aparecer

## 📝 Notas Importantes

- ✅ **El sistema valida automáticamente el día de la semana** según la jornada (implementado 25 feb 2026)
  - **Matutina/Vespertina**: Rechaza asistencias en sábados y domingos
  - **Fin de semana**: Rechaza asistencias de lunes a sábado, solo permite domingos
- Los mensajes de error indican claramente qué día es válido para cada jornada
- El sistema de cierre automático a medianoche sigue funcionando igual para todas las jornadas
- La validación se aplica tanto a estudiantes como a docentes

## 🔮 Mejoras Futuras Sugeridas

1. ~~**Validación de día de semana**~~ ✅ **IMPLEMENTADO** (25 feb 2026)
2. **Alertas visuales en frontend**: Mostrar advertencia preventiva si se intenta registrar en día incorrecto
3. **Reportes específicos**: Crear reportes filtrados solo por domingos para jornada "Fin de semana"
4. **Dashboard**: Mostrar contador separado para jornada de fin de semana
5. **Calendario visual**: Mostrar días hábiles por jornada en la interfaz

---

**Desarrollado por**: José Pablo Rivera  
**Fecha**: 25 de febrero de 2026
