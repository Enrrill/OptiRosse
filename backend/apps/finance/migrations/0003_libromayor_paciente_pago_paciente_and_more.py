import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clients', '0001_initial'),
        ('finance', '0002_libromayor_asiento_origen_metodopago_activo_and_more'),
        ('pacientes', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='libromayor',
            name='paciente',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.RESTRICT,
                to='pacientes.paciente',
                verbose_name='paciente',
            ),
        ),
        migrations.AddField(
            model_name='pago',
            name='paciente',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.RESTRICT,
                to='pacientes.paciente',
                verbose_name='paciente',
            ),
        ),
        migrations.AlterField(
            model_name='libromayor',
            name='cliente',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.RESTRICT,
                to='clients.clienteoptica',
                verbose_name='cliente',
            ),
        ),
        migrations.AlterField(
            model_name='pago',
            name='cliente',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.RESTRICT,
                to='clients.clienteoptica',
                verbose_name='cliente',
            ),
        ),
        migrations.AddIndex(
            model_name='libromayor',
            index=models.Index(fields=['paciente', 'creado_en'], name='lm_idx_paciente_creado'),
        ),
        migrations.AddConstraint(
            model_name='libromayor',
            constraint=models.CheckConstraint(
                condition=(
                    models.Q(cliente__isnull=False, paciente__isnull=True) |
                    models.Q(cliente__isnull=True, paciente__isnull=False)
                ),
                name='libro_mayor_exactamente_un_destinatario',
            ),
        ),
        migrations.AddConstraint(
            model_name='pago',
            constraint=models.CheckConstraint(
                condition=(
                    models.Q(cliente__isnull=False, paciente__isnull=True) |
                    models.Q(cliente__isnull=True, paciente__isnull=False)
                ),
                name='pago_exactamente_un_destinatario',
            ),
        ),
    ]
