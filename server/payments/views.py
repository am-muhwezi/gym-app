from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response

class HelloPaymentView(generics.GenericAPIView):

    def get(self, request):
        return Response({"message": "Hello Payments"}, status=status.HTTP_200_OK)