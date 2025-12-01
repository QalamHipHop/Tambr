# Tambr Data Storage

This directory contains the data storage structure for the Tambr platform. All data is stored in JSON format and version-controlled through Git.

## Directory Structure

### `/events`
Contains all event-related data. Each event is stored as a JSON file with the following structure:
- Event metadata (name, description, creator, etc.)
- Ticket information (price, quantity, sold count)
- Contract deployment information
- Event status and timeline

**Schema**: See `events/schema.json`

### `/users`
Contains user profile information and account data:
- Wallet addresses and user metadata
- Events created by the user
- Tickets owned by the user
- User reputation and verification status
- Account creation timestamp

**Schema**: See `users/schema.json`

### `/transactions`
Contains all transaction records:
- Ticket purchases
- Token trades
- Event creation transactions
- Transaction status and blockchain confirmation
- Gas usage and block information

**Schema**: See `transactions/schema.json`

## Data Management

### Adding New Data
1. Create a new JSON file in the appropriate directory
2. Follow the schema defined in `schema.json`
3. Commit and push the changes to the repository

### Updating Existing Data
1. Modify the JSON file directly
2. Ensure the data still conforms to the schema
3. Commit and push the changes with a descriptive message

### Querying Data
Data can be queried directly from the Git repository:
- Clone the repository
- Read the JSON files
- Parse and process the data as needed

## Example Data Files

### Event Example
```json
{
  "id": "evt_001",
  "name": "Web3 Conference 2024",
  "description": "Annual conference for Web3 developers",
  "creator": "0x1234567890123456789012345678901234567890",
  "createdAt": "2024-01-15T10:30:00Z",
  "eventDate": "2024-03-15T14:00:00Z",
  "location": "San Francisco, CA",
  "ticketPrice": "0.5",
  "totalTickets": 500,
  "ticketsSold": 250,
  "status": "active",
  "contractAddress": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
}
```

### User Example
```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "username": "john_doe",
  "email": "john@example.com",
  "joinedAt": "2024-01-10T08:00:00Z",
  "eventsCreated": ["evt_001", "evt_002"],
  "ticketsOwned": ["tkt_001", "tkt_002", "tkt_003"],
  "totalSpent": "2.5",
  "reputation": 95,
  "verified": true
}
```

### Transaction Example
```json
{
  "id": "txn_001",
  "type": "ticket_purchase",
  "from": "0x1111111111111111111111111111111111111111",
  "to": "0x2222222222222222222222222222222222222222",
  "amount": "0.5",
  "currency": "ETH",
  "eventId": "evt_001",
  "ticketId": "tkt_001",
  "status": "completed",
  "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "timestamp": "2024-02-01T15:30:00Z",
  "gasUsed": "50000",
  "blockNumber": 19000000
}
```

## Data Integrity

- All JSON files are validated against their respective schemas
- Timestamps are stored in ISO 8601 format for consistency
- Ethereum addresses are stored in lowercase for consistency
- Amounts are stored as strings to preserve precision
- All files should be properly formatted and indented

## Backup and Recovery

Since all data is stored in Git:
- Every change is tracked and can be reverted
- The entire history is preserved
- Multiple backups exist across all cloned repositories
- Data can be recovered from any previous commit

## Future Enhancements

- Implement data validation scripts
- Add automated backup procedures
- Create data migration tools
- Implement data archival for old records
- Add data encryption for sensitive information
