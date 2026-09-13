import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('clients', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Paciente',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('creado_en', models.DateTimeField(auto_now_add=True)),
                ('actualizado_en', models.DateTimeField(auto_now=True)),
                ('activo', models.BooleanField(default=True)),
                ('nombre', models.CharField(max_length=100, verbose_name='nombre')),
                ('apellido', models.CharField(blank=True, default='', max_length=100, verbose_name='apellido')),
                ('cedula', models.CharField(blank=True, max_length=20, null=True, unique=True, verbose_name='cédula')),
                ('telefono', models.CharField(blank=True, default='', max_length=30, verbose_name='teléfono')),
                ('correo', models.EmailField(blank=True, default='', max_length=254, verbose_name='correo')),
                ('fecha_nacimiento', models.DateField(blank=True, null=True, verbose_name='fecha de nacimiento')),
                ('notas', models.TextField(blank=True, default='', verbose_name='notas')),
                (
                    'cliente_optica',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='pacientes',
                        to='clients.clienteoptica',
                        verbose_name='cliente óptica asociado',
                    ),
                ),
            ],
            options={
                'verbose_name': 'paciente',
                'verbose_name_plural': 'pacientes',
                'db_table': 'pacientes',
                'indexes': [models.Index(fields=['cedula'], name='pacientes_idx_cedula')],
            },
        ),
    ]
