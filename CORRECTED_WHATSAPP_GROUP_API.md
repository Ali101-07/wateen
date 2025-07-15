# 📱 **Corrected WhatsApp Group API Documentation**

## **Update WhatsApp Group**
```
PUT http://localhost:5000/api/whatsapp-groups/1
Authorization: Bearer your_token_here
Content-Type: application/json
```

### ✅ **Correct Request Body:**
```json
{
  "group_name": "Updated Marketing Team",
  "description": "Updated description",
  "member_count": 75,
  "status": "active"
}
```

### **Available Fields:**
- `group_name` (string) - Name of the group
- `description` (string) - Group description
- `member_count` (integer) - Number of members
- `status` (string) - "active" or "inactive"
- `profile_picture` (string) - URL to profile picture

### **Status Values:**
- `"active"` - Group is active
- `"inactive"` - Group is inactive

---

## **Create WhatsApp Group**
```
POST http://localhost:5000/api/whatsapp-groups
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "group_name": "Marketing Team",
  "description": "Marketing department WhatsApp group",
  "status": "active"
}
```

## **Get All Groups**
```
GET http://localhost:5000/api/whatsapp-groups
Authorization: Bearer your_token_here

# With pagination and search:
GET http://localhost:5000/api/whatsapp-groups?page=1&limit=10&search=marketing&status=active
```

## **Get Group by ID**
```
GET http://localhost:5000/api/whatsapp-groups/1
Authorization: Bearer your_token_here
```

## **Delete Group (Soft Delete)**
```
DELETE http://localhost:5000/api/whatsapp-groups/1
Authorization: Bearer your_token_here
```

---

## **Expected Success Response:**
```json
{
  "success": true,
  "message": "Group updated successfully",
  "data": {
    "id": 1,
    "group_name": "Updated Marketing Team",
    "description": "Updated description",
    "member_count": 75,
    "status": "active",
    "created_at": "2024-01-04T12:00:00Z",
    "updated_at": "2024-01-04T12:30:00Z"
  }
}
```

---

## **❌ Common Mistakes to Avoid:**
- ❌ `max_members` → ✅ Use `member_count`
- ❌ `is_active: true` → ✅ Use `status: "active"`
- ❌ `name` → ✅ Use `group_name` 