"""
Microsoft Graph API data source — provision stub.

Set these environment variables to enable:
  GRAPH_TENANT_ID      Azure AD tenant ID
  GRAPH_CLIENT_ID      App registration client ID
  GRAPH_CLIENT_SECRET  App registration client secret

Auth: OAuth2 client credentials flow
  POST https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token
  scope: https://graph.microsoft.com/.default

Endpoints used:
  Emails:   GET /me/messages?$select=id,subject,from,receivedDateTime,body,isRead,importance
  Teams:    GET /teams/{team_id}/channels/{channel_id}/messages
  Members:  GET /groups/{group_id}/members?$select=displayName,mail,jobTitle

Teams/channels IDs must also be configured:
  GRAPH_TEAM_ID         Microsoft Teams team ID
  GRAPH_CHANNEL_IDS     comma-separated channel IDs to fetch messages from
  GRAPH_GROUP_ID        Azure AD group ID for team member lookup
  GRAPH_MAILBOX_USER    UPN of the mailbox to read (e.g. pm@your-org.com)
"""
import os
import logging

from sources.base import DataSource
from models import NormalizedTicket, NormalizedEmail, NormalizedMessage, NormalizedMember

logger = logging.getLogger(__name__)


class GraphSource(DataSource):
    def __init__(self):
        self.tenant_id = os.environ["GRAPH_TENANT_ID"]
        self.client_id = os.environ["GRAPH_CLIENT_ID"]
        self.client_secret = os.environ["GRAPH_CLIENT_SECRET"]
        logger.info("GraphSource initialised for tenant %s", self.tenant_id)

    def _get_token(self) -> str:
        # TODO: implement OAuth2 client credentials token fetch
        # POST https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token
        raise NotImplementedError

    def get_tickets(self) -> list[NormalizedTicket]:
        raise NotImplementedError("Graph API does not provide Jira tickets. Use JiraSource.")

    def get_emails(self) -> list[NormalizedEmail]:
        # TODO: implement
        # GET https://graph.microsoft.com/v1.0/me/messages
        # Parse using same field mapping as MockSource.get_emails()
        raise NotImplementedError(
            "Microsoft Graph email integration not yet implemented. "
            "Remove GRAPH_* env vars to use mock data."
        )

    def get_messages(self) -> list[NormalizedMessage]:
        # TODO: implement
        # GET https://graph.microsoft.com/v1.0/teams/{team_id}/channels/{channel_id}/messages
        # Iterate GRAPH_CHANNEL_IDS, merge results
        raise NotImplementedError("Microsoft Graph Teams integration not yet implemented.")

    def get_members(self) -> list[NormalizedMember]:
        # TODO: implement
        # GET https://graph.microsoft.com/v1.0/groups/{group_id}/members
        raise NotImplementedError("Microsoft Graph member lookup not yet implemented.")
