# 💬 **Corrected Message API Documentation**

## **Create Message**
```
POST http://localhost:5000/api/messages
Authorization: Bearer your_token_here
Content-Type: application/json
```

### **Individual Message:**
```json
{
  "recipient_type": "individual",
  "recipient_id": 1,
  "content_type": "text",
  "message_content": "Hello! This is a personal message."
}
```

### **Group Message:**
```json
{
  "recipient_type": "group", 
  "recipient_id": 1,
  "content_type": "text",
  "message_content": "Hello team! Important meeting tomorrow at 10 AM."
}
```

### **WhatsApp Group Message:**
```json
{
  "recipient_type": "whatsapp_group",
  "recipient_id": 1,
  "content_type": "text", 
  "message_content": "Meeting reminder for WhatsApp group!"
}
```

### **Message with Link Preview:**
```json
{
  "recipient_type": "individual",
  "recipient_id": 1,
  "content_type": "link_preview",
  "message_content": "Check out this amazing website!",
  "link_url": "https://example.com"
}
```

### **Scheduled Message:**
```json
{
  "recipient_type": "group",
  "recipient_id": 1,
  "content_type": "text",
  "message_content": "This message will be sent later",
  "scheduled_at": "2024-01-05T15:30:00Z"
}
```

## **Required Fields:**
- `recipient_type` (string) - "individual", "group", or "whatsapp_group"
- `message_content` (string) - The actual message text
- `content_type` (string) - "text", "link_preview", or "media_attachment"

## **Optional Fields:**
- `recipient_id` (integer) - ID of the recipient (user/group)
- `recipient_phone` (string) - Phone number for individual messages
- `link_url` (string) - URL for link preview messages
- `scheduled_at` (timestamp) - For scheduled messages
- `metadata` (object) - Additional data

## **Expected Success Response:**
```json
{
  "success": true,
  "message": "Message created successfully",
  "data": {
    "message": {
      "id": 1,
      "sender_id": 1,
      "recipient_type": "group",
      "recipient_id": 1,
      "content_type": "text",
      "message_content": "Hello team! Important meeting tomorrow at 10 AM.",
      "status": "pending",
      "created_at": "2024-01-04T12:00:00Z",
      "updated_at": "2024-01-04T12:00:00Z"
    }
  }
}
```

---

## **Field Mapping Reference:**
| Your Request | Correct Field | Description |
|--------------|---------------|-------------|
| `message_type` | `recipient_type` | Who receives the message |
| `content` | `message_content` | The message text |
| `group_id` | `recipient_id` | Target group/user ID |
| `subscriber_id` | `recipient_id` | Target user ID |
| (new) | `content_type` | Type of content being sent | 