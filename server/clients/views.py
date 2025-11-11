"""
Client Views
Thin controllers that handle HTTP requests and delegate business logic to services
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Client
from .serializers import ClientSerializer, ClientListSerializer, ClientCreateUpdateSerializer
from .services import ClientService


class ClientViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Client CRUD operations

    Endpoints:
    - GET    /api/clients/           - List all clients for authenticated trainer
    - POST   /api/clients/           - Create new client
    - GET    /api/clients/{id}/      - Get single client
    - PATCH  /api/clients/{id}/      - Update client
    - DELETE /api/clients/{id}/      - Delete client
    - POST   /api/clients/{id}/deactivate/ - Deactivate client
    - GET    /api/clients/statistics/ - Get client statistics
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ClientSerializer

    def get_queryset(self):
        """Get clients for authenticated trainer only"""
        return Client.objects.filter(trainer=self.request.user).select_related('trainer')

    def get_serializer_class(self):
        """Use different serializers based on action"""
        if self.action == 'list':
            return ClientListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ClientCreateUpdateSerializer
        return ClientSerializer

    def list(self, request):
        """
        List clients for authenticated trainer

        Query params:
        - status: Filter by status (active, inactive, suspended)
        - search: Search by name, email, or phone
        """
        status_filter = request.query_params.get('status')
        search_term = request.query_params.get('search')

        clients = self.get_queryset()  # Already filtered by trainer

        if status_filter:
            clients = clients.filter(status=status_filter)

        if search_term:
            from django.db.models import Q
            clients = clients.filter(
                Q(first_name__icontains=search_term) |
                Q(last_name__icontains=search_term) |
                Q(email__icontains=search_term) |
                Q(phone__icontains=search_term)
            )

        serializer = self.get_serializer(clients, many=True)
        return Response(serializer.data)

    def create(self, request):
        """Create new client for authenticated trainer"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Create client with authenticated trainer
        try:
            client = Client.objects.create(
                trainer=request.user,
                **serializer.validated_data
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Return full client data
        return Response(
            ClientSerializer(client).data,
            status=status.HTTP_201_CREATED
        )

    def retrieve(self, request, pk=None):
        """Get single client with full details"""
        try:
            client = self.get_queryset().get(pk=pk)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ClientSerializer(client)
        return Response(serializer.data)

    def update(self, request, pk=None):
        """Full update of client"""
        try:
            client = self.get_queryset().get(pk=pk)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(client, data=request.data)
        serializer.is_valid(raise_exception=True)

        # Delegate to service
        updated_client = ClientService.update_client(
            client,
            **serializer.validated_data
        )

        return Response(ClientSerializer(updated_client).data)

    def partial_update(self, request, pk=None):
        """Partial update of client"""
        try:
            client = self.get_queryset().get(pk=pk)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(client, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # Delegate to service
        updated_client = ClientService.update_client(
            client,
            **serializer.validated_data
        )

        return Response(ClientSerializer(updated_client).data)

    def destroy(self, request, pk=None):
        """Delete client"""
        try:
            client = self.get_queryset().get(pk=pk)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        client.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Deactivate a client
        Custom action demonstrating service delegation

        POST /api/clients/{id}/deactivate/
        Body: { "reason": "optional reason" }
        """
        try:
            client = self.get_queryset().get(pk=pk)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Delegate complex operation to service
        reason = request.data.get('reason')
        ClientService.deactivate_client(client, reason=reason)

        return Response({
            'status': 'client deactivated',
            'client': ClientSerializer(client).data
        })

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get trainer's client statistics
        Service handles data aggregation

        GET /api/clients/statistics/
        """
        stats = ClientService.get_client_statistics(request.user)
        return Response(stats)