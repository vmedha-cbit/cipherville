import { useState } from "react";

const SQL_GUIDE_CONTENT = `
# SQL Investigation Guide

## Basic SELECT Queries

### Select All Columns
\`\`\`sql
SELECT * FROM table_name;
\`\`\`

### Select Specific Columns
\`\`\`sql
SELECT column1, column2 FROM table_name;
\`\`\`

## Filtering Data

### WHERE Clause
\`\`\`sql
SELECT * FROM table_name WHERE column = 'value';
\`\`\`

### Multiple Conditions
\`\`\`sql
SELECT * FROM table_name 
WHERE column1 = 'value1' AND column2 > 100;
\`\`\`

### LIKE for Pattern Matching
\`\`\`sql
SELECT * FROM table_name WHERE name LIKE '%pattern%';
\`\`\`

## Sorting Results

### ORDER BY
\`\`\`sql
SELECT * FROM table_name ORDER BY column_name ASC;
SELECT * FROM table_name ORDER BY column_name DESC;
\`\`\`

## Limiting Results

### LIMIT
\`\`\`sql
SELECT * FROM table_name LIMIT 10;
\`\`\`

## Joining Tables

### INNER JOIN
\`\`\`sql
SELECT * FROM table1 
INNER JOIN table2 ON table1.id = table2.foreign_id;
\`\`\`

## Aggregation Functions

### COUNT
\`\`\`sql
SELECT COUNT(*) FROM table_name;
\`\`\`

### SUM, AVG, MAX, MIN
\`\`\`sql
SELECT SUM(amount), AVG(amount), MAX(amount), MIN(amount) 
FROM table_name;
\`\`\`

## GROUP BY

\`\`\`sql
SELECT category, COUNT(*) 
FROM table_name 
GROUP BY category;
\`\`\`

## Date/Time Queries

\`\`\`sql
SELECT * FROM table_name 
WHERE date_column = '2024-01-15';

SELECT * FROM table_name 
WHERE datetime_column >= '2024-01-15 10:00:00';
\`\`\`

## Tips for Investigation

1. **Start Broad**: Use \`SELECT * FROM table_name LIMIT 10\` to see the data structure
2. **Check Schema**: Review available columns before writing complex queries
3. **Filter Gradually**: Add WHERE clauses one at a time
4. **Use DISTINCT**: \`SELECT DISTINCT column FROM table\` to find unique values
5. **Combine Conditions**: Use AND/OR to narrow down results
`;

export default function SQLGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-ember hover:bg-amber-600 text-black font-bold py-3 px-6 rounded-lg shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2"
        style={{ boxShadow: "0 4px 20px rgba(251, 146, 60, 0.4)" }}
      >
        <span>📚</span>
        <span>SQL Guide</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="evidence-card max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                SQL Investigation Guide
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-ember text-2xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition"
              >
                ×
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 flex-1">
              <div className="prose prose-invert max-w-none">
                <div className="text-haze whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {SQL_GUIDE_CONTENT.split('\n').map((line, idx) => {
                    if (line.startsWith('# ')) {
                      return <h3 key={idx} className="text-amber-400 font-bold text-lg mt-4 mb-2">{line.replace('# ', '')}</h3>;
                    }
                    if (line.startsWith('## ')) {
                      return <h4 key={idx} className="text-amber-300 font-semibold text-base mt-3 mb-2">{line.replace('## ', '')}</h4>;
                    }
                    if (line.startsWith('```')) {
                      return null; // Skip code block markers
                    }
                    if (line.trim().startsWith('`') && line.includes('`')) {
                      return <div key={idx} className="bg-black/50 border border-ember/30 rounded p-3 my-2 font-mono text-green-400">{line.replace(/`/g, '')}</div>;
                    }
                    if (line.trim() === '') {
                      return <br key={idx} />;
                    }
                    return <p key={idx} className="mb-2">{line}</p>;
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/20 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="btn-investigate px-6 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
