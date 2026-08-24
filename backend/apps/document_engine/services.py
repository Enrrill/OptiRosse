from dataclasses import dataclass

from django.conf import settings
from django.template import Context, Engine, TemplateSyntaxError

from weasyprint import HTML

from backend.apps.core.choices import TipoDocumento
from backend.apps.core.services import AuditoriaService
from backend.apps.document_engine.models import PlantillaDocumento
from backend.apps.finance.models import Pago
from backend.apps.orders.models import Pedido
from backend.common.api.exceptions import ApiError

CONTENT_TYPES = {
    'html': 'text/html',
    'pdf': 'application/pdf',
}

EXTENSIONES = {
    'html': 'html',
    'pdf': 'pdf',
}


@dataclass
class DocumentoGenerado:
    contenido: bytes
    nombre_archivo: str
    content_type: str


class DocumentoService:
    MODELOS_POR_TIPO = {
        TipoDocumento.FACTURA: Pedido,
        TipoDocumento.NOTA_ENTREGA: Pedido,
        TipoDocumento.ORDEN_TRABAJO: Pedido,
        TipoDocumento.RECIBO_PAGO: Pago,
    }

    @staticmethod
    def _cliente_a_primitivas(cliente):
        return {
            'razon_social': cliente.razon_social,
            'nombre_comercial': cliente.nombre_comercial,
            'identificacion_fiscal': cliente.identificacion_fiscal,
            'correo': cliente.correo,
            'telefono': cliente.telefono,
            'direccion': cliente.direccion,
        }

    @staticmethod
    def _detalle_a_primitivas(detalle):
        variante = detalle.variante
        return {
            'cantidad': detalle.cantidad,
            'precio_unitario': detalle.precio_unitario,
            'precio_total': detalle.precio_total,
            'variante_sku': variante.sku,
            'variante_codigo_barras': variante.codigo_barras,
            'variante_color': variante.color,
            'variante_tamano': variante.tamano,
            'producto_marca': variante.producto.marca,
            'producto_codigo_modelo': variante.producto.codigo_modelo,
            'producto_descripcion': variante.producto.descripcion,
        }

    @staticmethod
    def _receta_a_primitivas(receta):
        return {
            'nombre_paciente': receta.nombre_paciente,
            'od_esfera': receta.od_esfera,
            'od_cilindro': receta.od_cilindro,
            'od_eje': receta.od_eje,
            'od_adicion': receta.od_adicion,
            'oi_esfera': receta.oi_esfera,
            'oi_cilindro': receta.oi_cilindro,
            'oi_eje': receta.oi_eje,
            'oi_adicion': receta.oi_adicion,
            'distancia_pupilar': receta.distancia_pupilar,
            'notas': receta.notas,
        }

    @classmethod
    def _contexto_pedido(cls, pedido):
        return {
            'pedido': {
                'numero_pedido': pedido.numero_pedido,
                'estado': pedido.estado,
                'estado_display': pedido.get_estado_display(),
                'subtotal': pedido.subtotal,
                'impuesto': pedido.impuesto,
                'total': pedido.total,
                'notas': pedido.notas,
                'creado_en': pedido.creado_en,
                'impuesto_rate': settings.IMPUESTO_RATE,
            },
            'cliente': cls._cliente_a_primitivas(pedido.cliente),
            'detalles': [cls._detalle_a_primitivas(d) for d in pedido.detalles.all()],
            'receta': cls._receta_a_primitivas(pedido.receta) if pedido.receta_id else None,
        }

    @classmethod
    def _contexto_pago(cls, pago):
        contexto = {
            'pago': {
                'id': pago.pk,
                'monto': pago.monto,
                'tasa_cambio': pago.tasa_cambio,
                'numero_referencia': pago.numero_referencia,
                'estado': pago.estado,
                'estado_display': pago.get_estado_display(),
                'fecha_pago': pago.fecha_pago,
            },
            'metodo_pago': {
                'nombre': pago.metodo_pago.nombre,
                'moneda': pago.metodo_pago.moneda,
            },
            'cliente': cls._cliente_a_primitivas(pago.cliente),
            'pedido': None,
        }
        if pago.pedido_id:
            contexto['pedido'] = {
                'numero_pedido': pago.pedido.numero_pedido,
                'total': pago.pedido.total,
            }
        return contexto

    @classmethod
    def _obtener_contexto(cls, tipo_documento, objeto):
        if tipo_documento == TipoDocumento.RECIBO_PAGO:
            return cls._contexto_pago(objeto)
        return cls._contexto_pedido(objeto)

    @staticmethod
    def _renderizar_html(plantilla, contexto):
        css = (
            f'<style>\n{plantilla.estilos_css}\n</style>\n'
            if plantilla.estilos_css
            else ''
        )
        try:
            template = Engine().from_string(css + plantilla.contenido_html)
            return template.render(Context(contexto))
        except TemplateSyntaxError as exc:
            raise ApiError(
                f'La plantilla tiene errores de sintaxis: {exc}',
                status_code=400,
                code='plantilla_invalida',
            ) from exc

    @staticmethod
    def _renderizar_pdf(html):
        try:
            return HTML(string=html, base_url='').write_pdf()
        except Exception as exc:  # noqa: BLE001 - errores de renderizado de la librería
            raise ApiError(
                f'No se pudo generar el PDF: {exc}',
                status_code=400,
                code='documento_render_invalido',
            ) from exc

    @classmethod
    def generar(cls, plantilla, objeto_id, formato='html', usuario=None, direccion_ip=''):
        modelo = cls.MODELOS_POR_TIPO.get(plantilla.tipo_documento)
        if modelo is None:
            raise ApiError(
                'El tipo de documento no tiene un modelo asociado',
                status_code=400,
                code='tipo_documento_invalido',
            )

        SELECT_RELATED = {
            Pedido: ('cliente', 'usuario', 'receta'),
            Pago: ('cliente', 'pedido', 'metodo_pago'),
        }
        try:
            objeto = modelo.objects.select_related(*SELECT_RELATED[modelo]).get(pk=objeto_id)
        except modelo.DoesNotExist:
            raise ApiError(
                'El objeto a documentar no existe',
                status_code=404,
                code='objeto_no_encontrado',
            )

        contexto = cls._obtener_contexto(plantilla.tipo_documento, objeto)
        html = cls._renderizar_html(plantilla, contexto)

        if formato == 'pdf':
            contenido = cls._renderizar_pdf(html)
        else:
            contenido = html.encode('utf-8')

        referencia = getattr(objeto, 'numero_pedido', None) or str(objeto.pk)
        nombre_archivo = f'{plantilla.tipo_documento}_{referencia}.{EXTENSIONES[formato]}'

        AuditoriaService.registrar(
            usuario=usuario,
            accion='generar_documento',
            tabla_afectada=PlantillaDocumento._meta.db_table,
            objeto_id=plantilla.pk,
            detalles={
                'tipo_documento': plantilla.tipo_documento,
                'formato': formato,
                'objeto': f'{modelo.__name__}#{objeto.pk}',
                'nombre_archivo': nombre_archivo,
            },
            direccion_ip=direccion_ip,
        )

        return DocumentoGenerado(
            contenido=contenido,
            nombre_archivo=nombre_archivo,
            content_type=CONTENT_TYPES[formato],
        )


class GeneradorDocxService:
    @staticmethod
    def generar(documento_empresa, datos_contexto, usuario=None, direccion_ip=''):
        import os
        import io
        from docxtpl import DocxTemplate

        if not documento_empresa.archivo or not os.path.exists(documento_empresa.archivo.path):
            raise ApiError(
                'El documento no tiene un archivo físico asociado en el servidor.',
                status_code=400,
                code='archivo_no_encontrado',
            )

        ext = documento_empresa.extension.lower()
        if ext not in ('docx', 'doc'):
            raise ApiError(
                'Solo se pueden generar documentos a partir de plantillas Word (.docx).',
                status_code=400,
                code='formato_invalido',
            )

        try:
            doc = DocxTemplate(documento_empresa.archivo.path)
            doc.render(datos_contexto)
            output = io.BytesIO()
            doc.save(output)
            contenido = output.getvalue()
        except Exception as exc:
            raise ApiError(
                f'Error al renderizar la plantilla Word: {exc}',
                status_code=400,
                code='error_render_docx',
            ) from exc

        nombre_base = os.path.splitext(os.path.basename(documento_empresa.archivo.name))[0]
        nombre_salida = f'{nombre_base}_generado.docx'

        AuditoriaService.registrar(
            usuario=usuario,
            accion='generar_documento',
            tabla_afectada='documentos_empresa',
            objeto_id=documento_empresa.pk,
            detalles={
                'nombre_documento': documento_empresa.nombre,
                'nombre_salida': nombre_salida,
                'contexto': datos_contexto,
            },
            direccion_ip=direccion_ip,
        )

        return DocumentoGenerado(
            contenido=contenido,
            nombre_archivo=nombre_salida,
            content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        )

