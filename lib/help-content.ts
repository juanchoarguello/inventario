export const helpContent = {
  facturacion: {
    introduccion: {
      title: "Introducción al Módulo de Facturación",
      content: [
        "El módulo de Facturación permite registrar y gestionar todas las ventas y compras realizadas en el sistema.",
        "Desde esta sección puedes:",
        "• Crear, editar y consultar facturas",
        "• Actualizar automáticamente los inventarios",
        "• Mantener un control del stock en tiempo real",
        "• Generar PDF profesionales de tus facturas",
        "• Enviar facturas por WhatsApp o Email"
      ],
      videoTimestamp: 0
    },

    accesoMenu: {
      title: "Acceso al Módulo",
      content: [
        "En el menú lateral izquierdo, encontrarás la opción 'Facturación' (segunda opción del menú principal).",
        "Al ingresar, el sistema presenta dos apartados principales:",
        "• 🟢 VENTA: Para registrar ventas a clientes",
        "• 🔵 COMPRA: Para registrar compras a proveedores",
        "Selecciona el tipo de factura que deseas generar según la operación a realizar.",
        "Usa los atajos de teclado para mayor velocidad:",
        "• Ctrl+N: Crear nueva parte",
        "• Shift+Enter: Agregar item a factura",
        "• Ctrl+G: Guardar factura"
      ],
      videoTimestamp: 15
    },

    busquedaProducto: {
      title: "Búsqueda de Productos",
      content: [
        "El producto puede buscarse de dos maneras:",
        "• Por nombre: Escribe el nombre completo o parcial",
        "• Por código: Escribe el código del producto",
        "Ejemplo práctico:",
        "Si escribes 'parte', el sistema mostrará sugerencias que contengan esa palabra, como 'parte prueba'.",
        "Cada sugerencia muestra:",
        "• Nombre del producto",
        "• Código identificador",
        "• Stock disponible (ej: Stock: 5 unidades)",
        "• Precio actual",
        "✅ El sistema busca en tiempo real mientras escribes (búsqueda instantánea)."
      ],
      videoTimestamp: 45
    },

    edicionProducto: {
      title: "Edición del Producto",
      content: [
        "Al agregar el producto a la factura, se muestran todas sus características editables:",
        "Campos disponibles:",
        "• Nombre",
        "• Código",
        "• Stock actual (solo lectura en esta vista)",
        "• Precio (EDITABLE)",
        "• Tipo o categoría",
        "• Marca",
        "• Descripción",
        "• Descuento (EDITABLE)",
        "• Cantidad (EDITABLE)",
        "⚠️ IMPORTANTE: Cualquier cambio realizado aquí se actualiza automáticamente en el inventario.",
        "✅ Esto permite ajustar precios sobre la marcha sin salir de la facturación."
      ],
      videoTimestamp: 90
    },

    ejemploVenta: {
      title: "Ejemplo de Venta",
      content: [
        "Supongamos que vendemos:",
        "• 2 unidades de 'Parte Prueba 2'",
        "• Precio modificado a $50.000",
        "• Descripción actualizada: 'Primer cambio'",
        "• Marca: Nissan",
        "Después de confirmar la venta (Ctrl+G):",
        "1. ✅ El stock disminuye automáticamente",
        "   Ejemplo: Si había 5 unidades, al vender 2 el stock queda en 3",
        "2. ✅ El sistema genera una factura PDF con todos los detalles",
        "3. ✅ Los precios actualizados quedan guardados en el inventario",
        "4. ✅ Se registra la operación en el historial del sistema"
      ],
      videoTimestamp: 120
    },

    controlStock: {
      title: "Control del Stock",
      content: [
        "El stock se puede revisar desde:",
        "• El mismo módulo de Facturación (al buscar productos)",
        "• El módulo de Inventario (vista completa)",
        "Al buscar un producto, por ejemplo 'parte prueba', se mostrará:",
        "• Stock actualizado en tiempo real",
        "• Última actualización",
        "• Stock mínimo configurado",
        "⚠️ Si el stock está por debajo del mínimo, aparecerá una alerta roja.",
        "✅ Los triggers de la base de datos garantizan que el stock siempre esté sincronizado."
      ],
      videoTimestamp: 150
    },

    productoNuevo: {
      title: "Crear Producto Nuevo",
      content: [
        "Si intentas buscar una parte que no existe, el sistema:",
        "1. Mostrará un mensaje: 'No se encontró [nombre]'",
        "2. Ofrecerá un botón: 'Crear Nueva Parte'",
        "3. Al hacer click, abrirá un formulario completo",
        "Campos requeridos al crear:",
        "• Código: Se autogenera o puedes personalizarlo (ej: C0001)",
        "• Nombre: Nombre descriptivo del producto",
        "• Categoría: OBLIGATORIO para organización (si no sabes, elige 'Otros')",
        "Campos opcionales:",
        "• Marca",
        "• Descripción",
        "• Modelo compatible",
        "• Ubicación en bodega",
        "✅ La parte se crea automáticamente al agregar la primera línea a la factura."
      ],
      videoTimestamp: 180
    },

    stockNegativo: {
      title: "Stock Negativo - Caso Especial",
      content: [
        "⚠️ ATENCIÓN: El único caso en que puede presentarse stock negativo es:",
        "Cuando se crea una nueva parte y se vende inmediatamente sin haber existido antes en el inventario.",
        "Ejemplo del problema:",
        "• Creas 'Filtro ABC' (nueva)",
        "• Inmediatamente vendes 2 unidades",
        "• El sistema permite la venta",
        "• Resultado: Stock = -2",
        "✅ Cómo corregirlo:",
        "Simplemente registra una compra del mismo producto:",
        "• Stock actual: -2",
        "• Compras 3 unidades",
        "• Stock final: +1 (correcto)",
        "🟢 NOTA IMPORTANTE:",
        "Este comportamiento NO ocurre en compras. Las compras siempre actualizan el stock correctamente.",
        "🔵 En COMPRAS de partes nuevas:",
        "✅ El sistema crea la parte",
        "✅ Asigna el stock inicial correctamente",
        "✅ No hay stock negativo posible"
      ],
      videoTimestamp: 210
    },

    procesoCompra: {
      title: "Proceso de Compra",
      content: [
        "El proceso de compra es similar al de venta, pero con estas diferencias:",
        "1. El stock AUMENTA en lugar de disminuir",
        "2. Se actualiza el campo 'precio_compra' del producto",
        "3. Permite crear partes nuevas sin riesgo de stock negativo",
        "Ejemplo práctico:",
        "• Stock actual de 'Bujía X': 2 unidades",
        "• Realizas una compra de 5 unidades a $15.000",
        "• Stock final: 7 unidades",
        "• Precio de compra actualizado: $15.000",
        "✅ Si el producto no existía, se crea automáticamente con el stock inicial correcto.",
        "✅ El sistema distingue entre precio_compra y precio_venta para calcular márgenes."
      ],
      videoTimestamp: 240
    },

    recomendaciones: {
      title: "Recomendaciones Importantes",
      content: [
        "⚠️ EVITAR ventas con stock negativo:",
        "Esto puede generar errores de inventario y afectar la contabilidad real.",
        "Solución: Siempre registra primero una compra si el producto no tiene stock.",
        "⚠️ VERIFICAR el stock antes de cada venta:",
        "El sistema muestra el stock disponible en tiempo real al buscar productos.",
        "Si no hay unidades disponibles, registra una compra primero.",
        "⚠️ MANTENER categorías actualizadas:",
        "Las categorías ayudan a:",
        "• Organizar mejor el inventario",
        "• Búsquedas más rápidas",
        "• Reportes por tipo de producto",
        "• Control de qué productos se venden más",
        "✅ USAR atajos de teclado para velocidad:",
        "• Ctrl+N: Nueva parte",
        "• Shift+Enter: Agregar línea",
        "• Ctrl+G: Guardar",
        "• Enter: Navegar entre campos"
      ],
      videoTimestamp: 270
    },

    generacionPDF: {
      title: "Generación de PDF",
      content: [
        "Al guardar una factura, el sistema automáticamente:",
        "1. ✅ Genera un PDF profesional",
        "2. ✅ Incluye todos los detalles de la transacción",
        "3. ✅ Descarga el archivo a tu computadora",
        "Contenido del PDF:",
        "• Número de factura (autogenerado)",
        "• Fecha y hora",
        "• Datos del cliente/proveedor",
        "• Detalle de productos (código, nombre, cantidad, precio)",
        "• Subtotales y total",
        "• Método de pago",
        "• Notas adicionales",
        "Además puedes:",
        "• Enviar por WhatsApp (botón verde)",
        "• Enviar por Email (botón azul)",
        "• Imprimir directamente desde el PDF"
      ],
      videoTimestamp: 300
    }
  }
}

// URL del video tutorial completo
export const TUTORIAL_VIDEO_URL = "/public/facturacion.mp4"
