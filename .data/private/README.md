# Private stuff

Directorio con el listado de configuraciones para el API de Stripe y Mailgun.

api-keys.json
{
  "stripe" : {
    "protocol" : "https:",
    "host" : "api.stripe.com",
    "publishableKey" : "pk_test_create_your_publishable_key",
    "secretKey" : "sk_test_create_your_secret_key"
  },
  "mailgun" : {
    "protocol" : "https:",
    "host" : "api.mailgun.net",
    "from" : "postmaster@create_your_sandbox.mailgun.org",
    "secretKey" : "create_your_mailgun_api_key",
    "domainName" : "create_your_sandbox.mailgun.org"
  }
}
