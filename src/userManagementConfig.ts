

export const getBasicAuthHeader = (): string => {
  const emailAndToken = `${getBasicAuthUserName()}:${getBasicAuthApiToken()}`;
  const header = Buffer.from(emailAndToken).toString('base64');
  return `Basic ${header}`;
}

/**
 * Returns something like "some-bot@yourdomain.com".
 * This must be configured as an environment variable as follows:
 * > forge variables set MANAGE_USERS_USER_NAME xxxxxx
 * > forge variables set --environment production MANAGE_USERS_USER_NAME xxxxxx
 * > export FORGE_USER_VAR_MANAGE_USERS_USER_NAME=xxxxxx
 * See https://developer.atlassian.com/platform/forge/environments-and-versions/.
 */
const getBasicAuthUserName = (): string => {
  return process.env.MANAGE_USERS_USER_NAME;
}

/**
 * Returns something like "kjhgbjkhgjkhgjkhgkjhg....".
 * This must be configured as an environment variable as follows:
 * > forge variables set --encrypt MANAGE_USERS_API_TOKEN xxxxxx
 * > forge variables set --environment production --encrypt MANAGE_USERS_API_TOKEN xxxxxx
 * > export FORGE_USER_VAR_MANAGE_USERS_API_TOKEN=xxxxxx
 * See https://developer.atlassian.com/platform/forge/environments-and-versions/.
 */
const getBasicAuthApiToken = (): string => {
  return process.env.MANAGE_USERS_API_TOKEN;
}

/**
 * This must return the ID of the group that is added to the global permission called "Make bulk changes".
 * Returns something like "fb318bd2-e052-4860-8743-24c4c66081d4".
 * This must be configured as an environment variable as follows:
 * > forge variables set --encrypt BULK_OPS_APP_GROUP_ID xxxxxx
 * > forge variables set --environment production --encrypt BULK_OPS_APP_GROUP_ID xxxxxx
 * > export FORGE_USER_VAR_BULK_OPS_APP_GROUP_ID=xxxxxx
 * See https://developer.atlassian.com/platform/forge/environments-and-versions/.
 */
export const getBulkOpsAppGroupId = (): string => {
  return process.env.BULK_OPS_APP_GROUP_ID;
}

