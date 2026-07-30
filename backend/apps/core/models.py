from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

from backend.apps.core.base_models import ActivoMixin, TimeStampedModel
from backend.apps.core.choices import RolUsuario


class UsuarioManager(BaseUserManager):
    def create_user(self, nombre_usuario, correo, password=None, **extra_fields):
        if not nombre_usuario:
            raise ValueError('El nombre de usuario es obligatorio')
        if not correo:
            raise ValueError('El correo electrónico es obligatorio')
        correo = self.normalize_email(correo)
        usuario = self.model(nombre_usuario=nombre_usuario, correo=correo, **extra_fields)
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, nombre_usuario, correo, password=None, **extra_fields):
        extra_fields.setdefault('rol', RolUsuario.ADMINISTRADOR)
        return self.create_user(nombre_usuario, correo, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin, TimeStampedModel, ActivoMixin):
    nombre_usuario = models.CharField('nombre de usuario', max_length=150, unique=True)
    correo = models.EmailField('correo electrónico', max_length=254, unique=True)
    nombre = models.CharField('nombre', max_length=150, blank=True, default='')
    apellido = models.CharField('apellido', max_length=150, blank=True, default='')
    rol = models.CharField('rol', max_length=20, choices=RolUsuario.choices, default=RolUsuario.VENDEDOR_B2B)
    telefono = models.CharField('teléfono', max_length=30, blank=True, default='')

    objects = UsuarioManager()

    USERNAME_FIELD = 'nombre_usuario'
    REQUIRED_FIELDS = ['correo']

    class Meta:
        verbose_name = 'usuario'
        verbose_name_plural = 'usuarios'
        db_table = 'usuarios'

    def __str__(self):
        return f'{self.nombre_usuario} ({self.get_rol_display()})'

    def save(self, *args, **kwargs):
        if self.password and not self.password.startswith(('pbkdf2_', 'bcrypt', 'argon2')):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)


class RegistroAuditoria(TimeStampedModel):
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, verbose_name='usuario')
    accion = models.CharField('acción', max_length=100)
    tabla_afectada = models.CharField('tabla afectada', max_length=100)
    objeto_id = models.IntegerField('ID del objeto', null=True, blank=True)
    detalles = models.JSONField('detalles', null=True, blank=True)
    direccion_ip = models.CharField('dirección IP', max_length=45, blank=True, default='')

    class Meta:
        verbose_name = 'registro de auditoría'
        verbose_name_plural = 'registros de auditoría'
        db_table = 'registros_auditoria'

    def __str__(self):
        return f'{self.accion} - {self.creado_en}'
