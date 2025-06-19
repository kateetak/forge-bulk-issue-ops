
// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-server-info/#api-rest-api-3-serverinfo-get

export type ServerInfo = {
  baseUrl: string; // e.g. "https://your-domain.atlassian.net",
  version: string;
  versionNumbers: number[];
  buildDate: string;
  buildNumber: number;
  defaultLocale: {
    locale: string;
  },
  displayUrl: string; // e.g. https://instance.jira.your-domain.com
  displayUrlConfluence: string; // e.g. https://instance.confluence.your-domain.com
  displayUrlServicedeskHelpCenter: string; // e.g. https://instance.help.your-domain.com
  scmInfo: string; // e.g. "1f51473f5c7b75c1a69a0090f4832cdc5053702a"
  serverTime: string; // e.g. "2020-03-31T16:43:50.000+0000"

  serverTimeZone: string; // "Australia/Sydney",
  serverTitle: string; // "My Jira instance"
}