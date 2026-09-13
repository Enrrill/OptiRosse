from django.db import migrations, models


def migrar_vendedora_a_empleado(apps, schema_editor):
    Usuario = apps.get_model('core', 'Usuario')
    Usuario.objects.filter(
        rol__in=['vendedora', 'vendedor_b2b', 'almacen', 'tecnico_taller', 'contabilidad']
    ).update(rol='empleado')


def revertir_migracion(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_migrar_roles_usuario'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usuario',
            name='rol',
            field=models.CharField(
                choices=[('administrador', 'Administrador'), ('empleado', 'Empleado')],
                default='empleado',
                max_length=20,
                verbose_name='rol',
            ),
        ),
        migrations.RunPython(migrar_vendedora_a_empleado, reverse_code=revertir_migracion),
    ]
