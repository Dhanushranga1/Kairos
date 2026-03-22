import os
import logging

from sources.base import DataSource
from sources.mock import MockSource

logger = logging.getLogger(__name__)

_JIRA_VARS = ("JIRA_URL", "JIRA_EMAIL", "JIRA_TOKEN")
_GRAPH_VARS = ("GRAPH_TENANT_ID", "GRAPH_CLIENT_ID", "GRAPH_CLIENT_SECRET")


def get_source() -> DataSource:
    has_jira = all(os.environ.get(k) for k in _JIRA_VARS)
    has_graph = all(os.environ.get(k) for k in _GRAPH_VARS)

    if has_jira and has_graph:
        # When both are configured, a CompositeSource would combine them:
        #   tickets from JiraSource, emails+messages from GraphSource
        # Not yet implemented — fall through to error below.
        logger.error(
            "Jira + Graph credentials found but CompositeSource is not yet implemented. "
            "Falling back to MockSource."
        )
        return MockSource()

    if has_jira:
        from sources.jira import JiraSource
        logger.info("Using JiraSource")
        return JiraSource()

    if has_graph:
        from sources.graph import GraphSource
        logger.info("Using GraphSource")
        return GraphSource()

    logger.info("No live API credentials found — using MockSource")
    return MockSource()
