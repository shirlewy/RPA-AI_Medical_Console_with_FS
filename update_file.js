const fs = require('fs');

const generatedData = JSON.parse(fs.readFileSync('generated_code.json', 'utf-8'));
let targetFile = fs.readFileSync('src/components/DepartmentMatrix.tsx', 'utf-8');

// Replace literatureData
const litDataRegex = /const literatureData = \[([\s\S]*?)\];/;
targetFile = targetFile.replace(litDataRegex, `const literatureData = ${generatedData.literatureDataStr};`);

// Replace getMockResults body
const mockResultsRegex = /const getMockResults = \(name: string\) => \{([\s\S]*?)\n\};/;
targetFile = targetFile.replace(mockResultsRegex, `const getMockResults = (name: string) => {\n${generatedData.mockResultsBody}\n};`);

fs.writeFileSync('src/components/DepartmentMatrix.tsx', targetFile);
