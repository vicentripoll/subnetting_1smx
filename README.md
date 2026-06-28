# Subnetting paso a paso 🌐

Una aplicación web interactiva que enseña y resuelve ejercicios de subnetting **paso a paso**, diseñada para el alumnado de **1SMX** (Sistemas Microinformáticos y en Red).

## 📋 Descripción

Esta herramienta educativa permite aprender y practicar **subnetting** de manera visual e interactiva. Introduce una dirección de red, una máscara CIDR y el número de subredes que deseas crear, ¡y la aplicación te mostrará cada paso del proceso de cálculo!

### Características

- ✅ **Cálculo FLSM** (Fixed Length Subnet Mask): Divide una red en subredes de tamaño igual
- 🔄 **Navegación interactiva**: Avanza y retrocede por los pasos del ejercicio
- 📊 **Interfaz visual clara**: Información detallada de cada paso del proceso
- 🎯 **Validación de entrada**: Control de datos para garantizar cálculos correctos
- 🚀 **Preparado para VLSM**: La estructura está lista para añadir VLSM en futuras versiones

## 🛠️ Tecnologías

- **HTML5** - Estructura semántica
- **CSS3** - Diseño responsive y moderno
- **JavaScript vanilla** - Lógica de cálculo sin dependencias

## 📝 Cómo usar

1. Abre el archivo `index.html` en tu navegador
2. Introduce los parámetros del ejercicio:
   - **Red de origen**: Dirección IP de la red (ej: `192.168.10.0`)
   - **Máscara CIDR**: Prefijo de la red (ej: `/24`)
   - **Número de subredes**: Cuántas subredes iguales quieres crear
3. Haz clic en **"Actualizar ejercicio"**
4. Navega por los pasos usando **"Siguiente"** y **"Anterior"**
5. Usa **"Reiniciar"** para volver al primer paso

## 📖 Ejemplo de uso

**Enunciado**: Tienes la red `192.168.10.0/24` y necesitas crear **4 subredes** iguales.

La aplicación te mostrará:
1. ✓ Cálculo de bits necesarios (2^n ≥ subredes)
2. ✓ Nueva máscara de subred
3. ✓ Listado de todas las subredes
4. ✓ Primera subred: dirección de red, broadcast y rango de hosts
5. ✓ Resumen final

## 📂 Estructura de archivos

```
subnetting_1smx/
├── index.html          # Estructura HTML
├── style.css           # Estilos CSS
├── script.js           # Lógica JavaScript
├── prompt.txt          # Archivo de contexto (vacío)
└── README.md           # Este archivo
```

## 🔄 Validaciones

La aplicación valida:
- ✓ IP válida en formato `XXX.XXX.XXX.XXX`
- ✓ Máscara CIDR entre `/1` y `/30`
- ✓ Número de subredes como entero positivo

## 🚀 Próximas mejoras

- [ ] Implementar **VLSM** (Variable Length Subnet Mask)
- [ ] Ejercicios dinámicos automáticos
- [ ] Cálculos de subredes con diferentes máscaras
- [ ] Exportación de resultados (PDF/imagen)
- [ ] Modo oscuro

## 📚 Conceptos de subnetting

### FLSM (Fixed Length Subnet Mask)
Divide una red en subredes de **tamaño igual**. Es la técnica más sencilla y es la que actualmente implementa esta aplicación.

**Fórmula**: Para crear `n` subredes, necesitamos `k = ⌈log₂(n)⌉` bits de subred.

### VLSM (Variable Length Subnet Mask)
Divide una red en subredes de **tamaño diferente** según las necesidades. Viene en próximas versiones.

## 👨‍💼 Autoría

Proyecto educativo para **1SMX** desarrollado con propósitos didácticos.

## 📄 Licencia

Libre para uso educativo.

---

**¿Preguntas o sugerencias?** Abre un issue o contribuye al proyecto. 🤝
