from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from finance.models import Category, Transaction
from .serializers import CategorySerializer, TransactionSerializer

from hr.api.pagination import StandardResultsSetPagination

from .permissions import IsFinanceManagerOrAdmin

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    pagination_class = StandardResultsSetPagination
    
    permission_classes = [IsAuthenticated, IsFinanceManagerOrAdmin] 
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['type']
    search_fields = ['name']


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.select_related('category', 'payslip').all()
    serializer_class = TransactionSerializer
    
    pagination_class = StandardResultsSetPagination
    
    permission_classes = [IsAuthenticated, IsFinanceManagerOrAdmin] 
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'category': ['exact'],
        'category__type': ['exact'],
        'date': ['gte', 'lte', 'exact'],
    }
    search_fields = ['description']
    ordering_fields = ['date', 'amount', 'created_at']