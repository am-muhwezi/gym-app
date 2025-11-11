from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response

class HelloAnalyticsView(generics.GenericAPIView):

    def get(self, request):
        return Response({"message": "Hello Analytics"}, status=status.HTTP_200_OK)