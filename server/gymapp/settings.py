from pathlib import Path
from decouple import config


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config("SECRET_KEY") 
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config("DEBUG", cast=bool)

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '192.168.100.40', '*']  # '*' for development only

# HTTPS/SSL Settings for production (when behind nginx/Apache reverse proxy)
# This tells Django to trust the X-Forwarded-Proto header from the proxy
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Security settings for production (only when DEBUG is False)
if not DEBUG:
    SECURE_SSL_REDIRECT = True  # Redirect all HTTP to HTTPS
    SESSION_COOKIE_SECURE = True  # Send session cookies only over HTTPS
    CSRF_COOKIE_SECURE = True  # Send CSRF cookies only over HTTPS
    SECURE_HSTS_SECONDS = 31536000  # Enable HSTS for 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'authentication.apps.AuthenticationConfig',
    'clients.apps.ClientsConfig',
    'payments.apps.PaymentsConfig',
    'bookings.apps.BookingsConfig',
    'analytics.apps.AnalyticsConfig',

    # Third-party-apps
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    # 'django_extensions',  # Commented out - install if needed: pip install django-extensions
]

AUTH_USER_MODEL = 'authentication.User'

REST_FRAMEWORK = {
    'NON_FIELD_ERRORS_KEY': 'errors',
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'gymapp.pagination.StandardResultsSetPagination',
    'PAGE_SIZE': 20,  # Default page size (can be overridden per view)
}

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Vite dev server (standard port)
    "http://localhost:5173",  # Vite dev server (alternate port)
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://192.168.100.40:3000",  # Local network access
    "http://192.168.100.40:5173",
    # Production HTTPS origins
    "https://trainrup.fit",
    "https://www.trainrup.fit",
]

CORS_ALLOW_CREDENTIALS = True

# For development, allow all origins (comment out in production)
# CORS_ALLOW_ALL_ORIGINS = True

# CSRF trusted origins for production
CSRF_TRUSTED_ORIGINS = [
    "https://trainrup.fit",
    "https://www.trainrup.fit",
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'gymapp.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'gymapp.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Frontend URL for password reset links
FRONTEND_URL = config("FRONTEND_URL", default="http://localhost:5173")

# Email Configuration (for password reset emails)
# Note: Using Gmail API for sending emails (see authentication/gmail_utils.py)
EMAIL_BACKEND = config("EMAIL_BACKEND", default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = config("EMAIL_HOST", default='localhost')
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default='')
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default='')
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default='noreply@trainrup.fit')

# Gmail API Configuration
# Path to the Gmail API token file (token.pkl)
GMAIL_TOKEN_PATH = config("GMAIL_TOKEN_PATH", default=str(BASE_DIR / 'token.pkl'))
