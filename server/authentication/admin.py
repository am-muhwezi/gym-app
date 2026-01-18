from django.contrib import admin
from .models import User, TermsAcceptance, PasswordResetToken


# Register your models here.
admin.site.register(User)
admin.site.register(TermsAcceptance)
admin.site.register(PasswordResetToken)