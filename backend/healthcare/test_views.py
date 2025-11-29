from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@csrf_exempt
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def test_endpoint(request):
    """Test endpoint to verify API connectivity"""
    return Response({
        'message': 'Healthcare API is working!',
        'method': request.method,
        'user': str(request.user) if request.user.is_authenticated else 'Anonymous'
    })