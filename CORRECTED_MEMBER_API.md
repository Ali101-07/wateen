# 👥 **Corrected Member Management API Documentation**

## **Add Member to Group**
```
POST http://localhost:5000/api/whatsapp-groups/members/add
Authorization: Bearer your_token_here
Content-Type: application/json

{
  "group_id": 1,
  "member_name": "Alice Johnson",
  "member_number": "+1234567890",
  "status": "pending"
}
```

**Required Fields:**
- `group_id` (integer) - ID of the group
- `member_name` (string) - Full name of the member
- `member_number` (string) - Phone number with country code

**Optional Fields:**
- `status` (string) - Default: "pending" (values: "pending", "active", "inactive")

## **Import Members from Excel**
```
POST http://localhost:5000/api/whatsapp-groups/members/import
Authorization: Bearer your_token_here
Content-Type: multipart/form-data

# Form data:
group_id: 1
excel_file: [Upload Excel file with columns: member_name, member_number, status]
```

## **Download Sample Excel Template**
```
GET http://localhost:5000/api/whatsapp-groups/download-sample
Authorization: Bearer your_token_here
```

## **Excel File Format**
The Excel file should contain these columns:
- `member_name` - Full name of the member
- `member_number` - Phone number with country code (e.g., +923001234567)
- `status` - Member status (pending/active/inactive) - Optional, defaults to "pending"

**Sample Excel Data:**
| member_name | member_number | status |
|-------------|---------------|--------|
| John Doe    | +923001234567 | pending |
| Jane Smith  | +923001234568 | pending |

---

## **Important Field Mappings:**
- ✅ Use `member_name` (not `name`)
- ✅ Use `member_number` (not `phone`)
- ✅ Use `group_id` (integer, not string)
- ✅ Status values: "pending", "active", "inactive" 