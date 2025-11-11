from django.db import models


class Payment(models.Model):
    client = models.ForeignKey('clients.Client', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(auto_now_add=True)
    method = models.CharField(max_length=50)
