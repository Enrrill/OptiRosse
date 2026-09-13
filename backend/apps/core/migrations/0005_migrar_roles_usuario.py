from django.db import migrations


def migrar_roles(apps, schema_editor):
    Usuario = apps.get_model('core', 'Usuario')
    roles_eliminados = ['almacen', 'tecnico_taller', 'contabilidad', 'vendedor_b2b']
    Usuario.objects.filter(rol__in=roles_eliminados).update(rol='vendedora')


def revertir_roles(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_alter_registroauditoria_tabla_afectada_and_more'),
    ]

    operations = [
        migrations.RunPython(migrar_roles, reverse_code=revertir_roles),
    ]
