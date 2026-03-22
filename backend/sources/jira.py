"""
Jira Cloud data source — provision stub.

Set these environment variables to enable:
  JIRA_URL    e.g. https://your-org.atlassian.net
  JIRA_EMAIL  service account email
  JIRA_TOKEN  API token (from id.atlassian.com/manage-profile/security/api-tokens)

JQL used: project = KAI AND sprint in openSprints()
Endpoint:  GET {JIRA_URL}/rest/api/3/search?jql=...&fields=summary,status,priority,assignee,duedate,labels,description,issuelinks,customfield_10016,customfield_10020
"""
import os
import logging

from sources.base import DataSource
from models import NormalizedTicket, NormalizedEmail, NormalizedMessage, NormalizedMember

logger = logging.getLogger(__name__)


class JiraSource(DataSource):
    def __init__(self):
        self.url = os.environ["JIRA_URL"].rstrip("/")
        self.email = os.environ["JIRA_EMAIL"]
        self.token = os.environ["JIRA_TOKEN"]
        logger.info("JiraSource initialised for %s", self.url)

    def get_tickets(self) -> list[NormalizedTicket]:
        # TODO: implement — call GET {self.url}/rest/api/3/search
        # Use requests.get(url, auth=(self.email, self.token))
        # Parse response using same field mapping as MockSource
        raise NotImplementedError(
            "Jira live integration not yet implemented. "
            "Remove JIRA_URL/JIRA_EMAIL/JIRA_TOKEN env vars to use mock data."
        )

    def get_emails(self) -> list[NormalizedEmail]:
        raise NotImplementedError("Jira does not provide emails. Use GraphSource for Outlook.")

    def get_messages(self) -> list[NormalizedMessage]:
        raise NotImplementedError("Jira does not provide team messages. Use GraphSource for Teams.")

    def get_members(self) -> list[NormalizedMember]:
        # TODO: implement — call GET {self.url}/rest/api/3/users/search
        raise NotImplementedError("Jira member fetch not yet implemented.")
