# API Endpoints Documentation

## Authentication Required
All endpoints require JWT token in Authorization header: `Bearer <token>`

## Groups API

### GET /api/groups
Get all groups with pagination and filtering
- Query params: page, limit, is_active, search

### POST /api/groups
Create new WhatsApp group
- Body: name, description, group_id, invite_link, admin_user_id, member_count, max_members

### GET /api/groups/:id
Get single group by ID

### PUT /api/groups/:id
Update group details

### DELETE /api/groups/:id
Delete group permanently

### PUT /api/groups/:id/deactivate
Soft delete (deactivate) group

### GET /api/groups/statistics
Get group statistics

### GET /api/groups/my-groups
Get groups for current user

## Subscribers API

### GET /api/subscribers
Get all subscribers with pagination and filtering
- Query params: page, limit, status, search

### POST /api/subscribers
Create new subscriber
- Body: name, phone_number, email, whatsapp_id, status, tags, notes

### GET /api/subscribers/:id
Get single subscriber by ID

### PUT /api/subscribers/:id
Update subscriber details

### PUT /api/subscribers/:id/status
Update subscriber status
- Body: status (active, inactive, blocked, opted_out)

### DELETE /api/subscribers/:id
Delete subscriber permanently

## Messages API

### GET /api/messages
Get all messages with pagination and filtering
- Query params: page, limit, subscriber_id, group_id, direction, status, message_type, date_from, date_to

### POST /api/messages
Create new message
- Body: message_id, subscriber_id, group_id, message_type, content, media_url, direction, status, scheduled_at

### GET /api/messages/:id
Get single message by ID

### PUT /api/messages/:id
Update message details

### PUT /api/messages/:id/status
Update message status
- Body: status (pending, sent, delivered, read, failed), error_message

### GET /api/messages/subscriber/:subscriberId
Get messages for specific subscriber

### GET /api/messages/statistics
Get message statistics
- Query params: date_from, date_to

### DELETE /api/messages/:id
Delete message permanently

## Campaigns API

### GET /api/campaigns
Get all campaigns with pagination and filtering
- Query params: page, limit, status, search

### POST /api/campaigns
Create new campaign
- Body: name, description, message_template, target_type, status, scheduled_at

### GET /api/campaigns/:id
Get single campaign by ID

### PUT /api/campaigns/:id
Update campaign details

### GET /api/campaigns/statistics
Get campaign statistics

### DELETE /api/campaigns/:id
Delete campaign permanently

## Authentication API

### POST /api/auth/login
User login
- Body: email, password
- Returns: JWT token

### POST /api/auth/register
User registration
- Body: name, email, password, role

### GET /api/auth/profile
Get current user profile (requires auth)

All responses follow the format:
```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
``` 