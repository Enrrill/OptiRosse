from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_alter_registroauditoria_tabla_afectada'),
    ]

    operations = [
        migrations.AlterField(
            model_name='registroauditoria',
            name='tabla_afectada',
            field=models.CharField(
                choices=[
                    ('usuarios', 'Usuarios'),
                    ('clientes_optica', 'Clientes'),
                    ('pacientes', 'Pacientes'),
                    ('categorias', 'Categorías'),
                    ('productos', 'Productos'),
                    ('variantes_producto', 'Variantes'),
                    ('recetas_opticas', 'Recetas ópticas'),
                    ('pedidos', 'Pedidos'),
                    ('detalles_pedido', 'Detalles de pedido'),
                    ('contador_pedidos', 'Contador de pedidos'),
                    ('metodos_pago', 'Métodos de pago'),
                    ('pagos', 'Pagos'),
                    ('libro_mayor', 'Libro mayor'),
                    ('plantillas_documentos', 'Plantillas de documentos'),
                    ('documentos_empresa', 'Documentos de empresa'),
                    ('registros_auditoria', 'Registros de auditoría'),
                ],
                max_length=100,
                verbose_name='tabla afectada',
            ),
        ),
        migrations.AlterField(
            model_name='usuario',
            name='rol',
            field=models.CharField(
                choices=[('administrador', 'Administrador'), ('vendedora', 'Vendedora')],
                default='vendedora',
                max_length=20,
                verbose_name='rol',
            ),
        ),
    ]
