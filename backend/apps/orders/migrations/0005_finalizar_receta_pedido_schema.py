import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0004_migrar_recetas_pedidos_datos'),
        ('pacientes', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='recetaoptica',
            name='nombre_paciente',
        ),
        migrations.AlterField(
            model_name='recetaoptica',
            name='paciente',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.RESTRICT,
                related_name='recetas',
                to='pacientes.paciente',
                verbose_name='paciente',
            ),
        ),
        migrations.AddConstraint(
            model_name='pedido',
            constraint=models.CheckConstraint(
                condition=(
                    models.Q(cliente__isnull=False, paciente__isnull=True) |
                    models.Q(cliente__isnull=True, paciente__isnull=False)
                ),
                name='pedido_exactamente_un_destinatario',
            ),
        ),
    ]
