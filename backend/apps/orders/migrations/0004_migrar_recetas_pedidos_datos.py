from django.db import migrations


def migrar_datos_recetas_y_pedidos(apps, schema_editor):
    RecetaOptica = apps.get_model('orders', 'RecetaOptica')
    Paciente = apps.get_model('pacientes', 'Paciente')
    Pedido = apps.get_model('orders', 'Pedido')

    # 1. Poblar Paciente por cada RecetaOptica existente
    for receta in RecetaOptica.objects.all():
        nombre_raw = getattr(receta, 'nombre_paciente', '') or ''
        nombre = nombre_raw.strip() or f'Paciente #{receta.pk}'

        # Intentar separar nombre y apellido si hay espacio
        partes = nombre.split(' ', 1)
        nombre_paciente = partes[0]
        apellido_paciente = partes[1] if len(partes) > 1 else ''

        paciente, _ = Paciente.objects.get_or_create(
            nombre=nombre_paciente,
            apellido=apellido_paciente,
            defaults={'activo': True},
        )
        receta.paciente = paciente
        receta.save(update_fields=['paciente'])

    # 2. Actualizar pedidos existentes: tipo_pedido y estados renombrados
    estado_map = {
        'en_taller': 'en_laboratorio',
        'listo_para_despacho': 'listo_para_entrega',
        'enviado': 'entregado',
    }
    for pedido in Pedido.objects.all():
        pedido.tipo_pedido = 'laboratorio'
        if pedido.estado in estado_map:
            pedido.estado = estado_map[pedido.estado]
        pedido.save(update_fields=['tipo_pedido', 'estado'])


def revertir_migracion(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0003_refactor_receta_pedido_schema'),
        ('pacientes', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(migrar_datos_recetas_y_pedidos, reverse_code=revertir_migracion),
    ]
