from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response

class HelloBookingView(generics.GenericAPIView):

    def get(self, request):
        return Response({"message": "Hello Booking"}, status=status.HTTP_200_OK)