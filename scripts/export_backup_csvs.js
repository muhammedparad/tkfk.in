const fs = require('fs');
const path = require('path');

const backupPath = 'backups/full_database_backup_20261010.json';
const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

const csvDir = 'backups/local_table_csvs';
if (!fs.existsSync(csvDir)) fs.mkdirSync(csvDir, { recursive: true });

function jsonToCsv(items) {
  if (!items || items.length === 0) return '';
  const headers = Object.keys(items[0]);
  const rows = items.map(row => 
    headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return '""';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return '"' + str.replace(/"/g, '""') + '"';
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

for (const [table, rows] of Object.entries(data)) {
  const csvContent = jsonToCsv(rows);
  const filePath = path.join(csvDir, `${table}.csv`);
  fs.writeFileSync(filePath, csvContent, 'utf8');
  console.log(`Saved ${rows.length} rows to ${filePath}`);
}

const summary = {
  backup_created_at: new Date().toISOString(),
  location: path.resolve('backups'),
  tables: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length]))
};
fs.writeFileSync('backups/BACKUP_SUMMARY.json', JSON.stringify(summary, null, 2), 'utf8');
console.log('Summary created successfully:', summary);
