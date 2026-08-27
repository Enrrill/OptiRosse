from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clients', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='clienteoptica',
            name='dias_credito',
            field=models.IntegerField(
                'días de crédito',
                null=True,
                blank=True,
                default=None,
            ),
        ),
        migrations.AlterField(
            model_name='clienteoptica',
            name='limite_credito',
            field=models.DecimalField(
                'límite de crédito',
                max_digits=12,
                decimal_places=2,
                null=True,
                blank=True,
                default=None,
            ),
        ),
    ]
