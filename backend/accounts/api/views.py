import random
from datetime import timedelta
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse # type: ignore

from accounts.models import User, OTPVerification
from .serializers import OTPRequestSerializer, OTPVerifySerializer, UserSerializer

class RequestOTPView(APIView):
    @extend_schema(
        request=OTPRequestSerializer,
        responses={
            200: OpenApiResponse(description="OTP successfully sent to the registered phone number."),
            400: OpenApiResponse(description="No phone number is registered for this account."),
            404: OpenApiResponse(description="User with this email not found.")
        },
        summary="Request OTP (SMS-based)",
        description="Receives user's email and sends a 6-digit OTP code to their registered phone number if the user exists."
    )
    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {"error": "User with this email not found. Please contact HR."}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            if not user.phone_number:
                return Response(
                    {"error": "No phone number registered for this account. Cannot send OTP."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            code = str(random.randint(100000, 999999))
            expires_at = timezone.now() + timedelta(minutes=2)

            OTPVerification.objects.create(
                user=user,
                code=code,
                purpose='login',
                expires_at=expires_at
            )

            print("\n" + "="*40)
            print("MOCK SMS GATEWAY")
            print(f"To: {user.phone_number} (User: {user.email})")
            print(f"Message: Your Minerva login code is: {code}")
            print("="*40 + "\n")

            masked_phone = f"******{user.phone_number[-4:]}" if len(user.phone_number) > 4 else "******"

            return Response(
                {"message": f"OTP successfully sent to {masked_phone}."}, 
                status=status.HTTP_200_OK
            )
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    @extend_schema(
        request=OTPVerifySerializer,
        responses={
            200: OpenApiResponse(description="Login successful. JWT access and refresh tokens are returned."),
            400: OpenApiResponse(description="Invalid or expired OTP code."),
            404: OpenApiResponse(description="User with this email not found.")
        },
        summary="Verify OTP & Login",
        description="Validates the 6-digit OTP code. Issues JWT Access and Refresh tokens upon successful verification."
    )
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']

            try:
                user = User.objects.get(email=email)
                
                otp = OTPVerification.objects.filter(
                    user=user,
                    code=code,
                    purpose='login',
                    is_used=False,
                    expires_at__gt=timezone.now()
                ).latest('created_at')

                otp.is_used = True
                otp.save()

                refresh = RefreshToken.for_user(user)
                
                user_data = UserSerializer(user).data
                return Response({
                    "message": "Login successful.",
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    },
                    "user": user_data
                }, status=status.HTTP_200_OK)

            except User.DoesNotExist:
                return Response({"error": "User with this email not found."}, status=status.HTTP_404_NOT_FOUND)
            except OTPVerification.DoesNotExist:
                return Response({"error": "Invalid or expired OTP code."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)