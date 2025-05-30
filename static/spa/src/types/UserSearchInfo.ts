import { PageResponse } from "./PageResponse";
import { User } from "./User";

// https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-user-search/#api-rest-api-3-user-search-get

export type UserSearchInfo = PageResponse<User>;
