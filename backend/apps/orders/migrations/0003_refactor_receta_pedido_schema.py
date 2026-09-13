import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clients', '0001_initial'),
        ('orders', '0002_contadorpedido_recetaoptica_activo_and_more'),
        ('pacientes', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='recetaoptica',
            name='paciente',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.RESTRICT,
                related_name='recetas',
                to='pacientes.paciente',
                verbose_name='paciente',
            ),
        ),
        migrations.AddField(
            model_name='recetaoptica',
            name='creado_en',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='recetaoptica',
            name='actualizado_en',
            field=models.DateTimeField(auto_now=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='recetaoptica',
            name='medico_prescriptor',
            field=models.CharField(blank=True, default='', max_length=150, verbose_name='médico prescriptor'),
        ),
        migrations.AddField(
            model_name='pedido',
            name='paciente',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.RESTRICT,
                related_name='pedidos',
                to='pacientes.paciente',
                verbose_name='paciente',
            ),
        ),
        migrations.AddField(
            model_name='pedido',
            name='tipo_pedido',
            field=models.CharField(
                choices=[('laboratorio', 'Con Laboratorio'), ('mostrador', 'Venta de Mostrador')],
                default='laboratorio',
                max_length=20,
                verbose_name='tipo de pedido',
            ),
        ),
        migrations.AddField(
            model_name='pedido',
            name='receta_snapshot',
            field=models.JSONField(blank=True, null=True, verbose_name='snapshot de receta'),
        ),
        migrations.AlterField(
            model_name='pedido',
            name='cliente',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.RESTRICT,
                related_name='pedidos',
                to='clients.clienteoptica',
                verbose_name='cliente óptica',
            ),
        ),
        migrations.AlterField(
            model_name='pedido',
            name='receta',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='pedidos',
                to='orders.recetaoptica',
                verbose_name='receta óptica',
            ),
        ),
        migrations.AlterField(
            model_name='pedido',
            name='estado',
            field=models.CharField(
                choices=[
                    ('borrador', 'Borrador'),
                    ('confirmado', 'Confirmado'),
                    ('en_laboratorio', 'En Laboratorio'),
                    ('listo_para_entrega', 'Listo para Entrega'),
                    ('entregado', 'Entregado'),
                    ('cancelado', 'Cancelado'),
                ],
                default='borrador',
                max_length=20,
                verbose_name='estado',
            ),
        ),
    ]
