from abc import ABC, abstractmethod
from models import NormalizedData, NormalizedTicket, NormalizedEmail, NormalizedMessage, NormalizedMember


class DataSource(ABC):
    @abstractmethod
    def get_tickets(self) -> list[NormalizedTicket]: ...

    @abstractmethod
    def get_emails(self) -> list[NormalizedEmail]: ...

    @abstractmethod
    def get_messages(self) -> list[NormalizedMessage]: ...

    @abstractmethod
    def get_members(self) -> list[NormalizedMember]: ...

    def get_all(self) -> NormalizedData:
        return NormalizedData(
            tickets=self.get_tickets(),
            emails=self.get_emails(),
            messages=self.get_messages(),
            members=self.get_members(),
        )
