from django.core.management.base import BaseCommand
from backend.apps.core.models import Usuario
from backend.apps.clients.models import ClienteOptica
from backend.apps.inventory.models import Categoria, Producto, VarianteProducto
from backend.apps.orders.models import RecetaOptica, Pedido
from backend.apps.finance.models import MetodoPago, Pago, LibroMayor


class Command(BaseCommand):
    help = 'Normaliza y estandariza los datos existentes en la base de datos (nombres, correos, RIF, teléfonos, SKUs).'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Iniciando normalización de datos existentes...'))

        models_to_normalize = [
            ('Usuarios', Usuario),
            ('Clientes', ClienteOptica),
            ('Categorías', Categoria),
            ('Productos', Producto),
            ('Variantes de Producto', VarianteProducto),
            ('Recetas Ópticas', RecetaOptica),
            ('Pedidos', Pedido),
            ('Métodos de Pago', MetodoPago),
            ('Pagos', Pago),
            ('Libro Mayor', LibroMayor),
        ]

        total_updated = 0
        for name, model_cls in models_to_normalize:
            count = 0
            for obj in model_cls.objects.all():
                obj.save()
                count += 1
            self.stdout.write(self.style.SUCCESS(f' - {name}: {count} registros procesados/normalizados.'))
            total_updated += count

        self.stdout.write(self.style.SUCCESS(f'Normalización completada exitosamente. Total: {total_updated} registros.'))
