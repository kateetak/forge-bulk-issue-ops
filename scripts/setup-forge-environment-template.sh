
#!/bin/bash

# Set BULK_OPS_APP_GROUP_ID
forge variables set BULK_OPS_APP_GROUP_ID [your-bulk-ops-group-id]
forge variables set --environment production BULK_OPS_APP_GROUP_ID [your-bulk-ops-group-id]
export FORGE_USER_VAR_BULK_OPS_APP_GROUP_ID=[your-bulk-ops-group-id]

# Set SITE_DOMAIN
forge variables set SITE_DOMAIN [your-site].atlassian.net
forge variables set --environment production SITE_DOMAIN [your-site].atlassian.net
export FORGE_USER_VAR_SITE_DOMAIN=[your-site].atlassian.net

# Set MANAGE_USERS_USER_NAME
forge variables set MANAGE_USERS_USER_NAME [your-api-username]
forge variables set --environment production MANAGE_USERS_USER_NAME [your-api-username]
export FORGE_USER_VAR_MANAGE_USERS_USER_NAME=[your-api-username]

# Set encrypted MANAGE_USERS_API_TOKEN
forge variables set --encrypt MANAGE_USERS_API_TOKEN [your-api-token]
forge variables set --environment production --encrypt MANAGE_USERS_API_TOKEN [your-api-token]
export FORGE_USER_VAR_MANAGE_USERS_API_TOKEN=[your-api-token]
