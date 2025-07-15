# 📱 **Corrected WhatsApp Groups API Documentation**

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

## **Get All WhatsApp Groups**
```
GET http://localhost:5000/api/whatsapp-groups
Authorization: Bearer your_token_here

# With filters
GET http://localhost:5000/api/whatsapp-groups?page=1&limit=10&search=marketing&status=active&sortBy=created_at&sortOrder=DESC
```

## **Get Group by ID**
```
GET http://localhost:5000/api/whatsapp-groups/1
Authorization: Bearer your_token_here
```

## **Update Group**
```
PUT http://localhost:5000/api/whatsapp-groups/1
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "group_name": "Updated Marketing Team",
  "description": "Updated description",
  "status": "active"
}
```

## **Delete Group** (Soft Delete)
```
DELETE http://localhost:5000/api/whatsapp-groups/1
Authorization: Bearer your_token_here
```

## **Get Group Options** (For Dropdowns)
```
GET http://localhost:5000/api/whatsapp-groups/options
Authorization: Bearer your_token_here
```

## **Get Group Statistics**
```
GET http://localhost:5000/api/whatsapp-groups/statistics
Authorization: Bearer your_token_here
```

## **Add Member to Group**
```
POST http://localhost:5000/api/whatsapp-groups/members/add
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "group_id": 1,
  "name": "Alice Johnson",
  "phone": "+1234567890",
  "email": "alice@example.com",
  "department": "Marketing",
  "position": "Manager",
  "status": "active"
}
```

## **Import Members from Excel**
```
POST http://localhost:5000/api/whatsapp-groups/members/import
Authorization: Bearer your_token_here
Content-Type: multipart/form-data

# Form data:
excel_file: [Upload Excel file]
```

## **Download Sample Excel Template**
```
GET http://localhost:5000/api/whatsapp-groups/download-sample
Authorization: Bearer your_token_here
```

---

## **Important Notes:**
1. **Field Name:** Use `group_name` not `name` for group creation
2. **Status Field:** Use `status` not `is_active` (values: "active", "inactive")
3. **Authentication:** All endpoints require Bearer token in Authorization header
4. **File Upload:** Use `excel_file` as the form field name for Excel imports 