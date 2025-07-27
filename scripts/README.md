# Database Management Scripts

This directory contains utility scripts for managing the database.

## Delete All Students Script

### Overview
The `delete-all-students.js` script safely removes all students from the database while maintaining data integrity.

### What it does:
1. **Deletes all attendance records** (to avoid foreign key constraint errors)
2. **Deletes all students** from the database
3. **Resets class student counts** to 0

### Usage

#### Method 1: Using npm scripts (Recommended)
```bash
# Interactive mode (asks for confirmation)
npm run delete-all-students

# Dry run (shows what would be deleted without actually deleting)
npm run delete-all-students:dry

# Auto-confirm (skips confirmation prompt)
npm run delete-all-students:confirm
```

#### Method 2: Direct node execution
```bash
# Interactive mode
node scripts/delete-all-students.js

# Dry run mode
node scripts/delete-all-students.js --dry-run

# Auto-confirm mode
node scripts/delete-all-students.js --confirm

# Show help
node scripts/delete-all-students.js --help
```

### Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Shows what would be deleted without actually performing deletions |
| `--confirm` | Skips the confirmation prompt and proceeds automatically |
| `--help`, `-h` | Shows help information |

### Safety Features

#### 🛡️ **Built-in Protections:**
- **Confirmation prompt** - Asks for user confirmation before deletion
- **Dry run mode** - Test the script without making changes
- **Statistics display** - Shows current database state before and after
- **Error handling** - Graceful error handling with detailed messages
- **Transaction safety** - Uses Prisma's built-in transaction handling

#### 📊 **Information Display:**
- Current number of students, attendance records, and classes
- What will be deleted
- Progress updates during deletion
- Final verification of database state

### Example Output

```
🗑️  DELETE ALL STUDENTS SCRIPT
=====================================

📊 Getting current database statistics...

Current database state:
  👥 Students: 432
  📋 Attendance Records: 9076
  🏫 Classes: 12

⚠️  This script will:
  • Delete ALL 432 students
  • Delete ALL 9076 attendance records
  • Reset student counts in all 12 classes to 0

💀 THIS ACTION CANNOT BE UNDONE!

Are you sure you want to delete ALL students? (y/N): y

🚀 Starting deletion process...

1️⃣  Deleting all attendance records...
   ✅ Deleted 9076 attendance records

2️⃣  Deleting all students...
   ✅ Deleted 432 students

3️⃣  Resetting class student counts...
   ✅ Reset student count in 12 classes

🔍 Verifying final state...

Final database state:
  👥 Students: 0
  📋 Attendance Records: 0
  🏫 Classes: 12

🎉 DELETION COMPLETED SUCCESSFULLY!
=====================================
✅ Deleted 432 students
✅ Deleted 9076 attendance records
✅ Reset 12 class student counts
```

### Use Cases

#### 🧪 **Testing & Development:**
```bash
# Test the script without making changes
npm run delete-all-students:dry

# Reset database for testing
npm run delete-all-students:confirm
```

#### 🔄 **Database Reset:**
```bash
# Interactive reset with confirmation
npm run delete-all-students
```

#### 🚀 **Automated Scripts:**
```bash
# Use in CI/CD or automated testing
npm run delete-all-students:confirm
```

### Technical Details

#### **Database Operations:**
1. `prisma.attendanceRecord.deleteMany({})` - Removes all attendance records
2. `prisma.student.deleteMany({})` - Removes all students
3. `prisma.class.updateMany({ data: { studentCount: 0 } })` - Resets class counts

#### **Foreign Key Handling:**
The script handles foreign key constraints by deleting attendance records before students, preventing database constraint violations.

#### **Error Handling:**
- Comprehensive error catching and reporting
- Graceful script termination on errors
- Database connection cleanup

### Prerequisites

- Node.js installed
- Prisma client configured
- Database connection established
- Proper permissions to delete records

### Security Notes

⚠️ **Important Warnings:**
- This script **permanently deletes** all student data
- **Cannot be undone** once executed
- Use `--dry-run` first to verify what will be deleted
- Ensure you have database backups if needed
- Only run in development/testing environments unless absolutely necessary

### Troubleshooting

#### Common Issues:
1. **Database connection errors** - Check your `.env` file and database connection
2. **Permission errors** - Ensure the database user has DELETE permissions
3. **Foreign key constraints** - The script handles this automatically

#### Getting Help:
```bash
node scripts/delete-all-students.js --help
```
