// Simple test script for task matching algorithm
// Run with: node test-matching.js

// Test cases for fuzzy matching
const testCases = [
  // Case sensitivity tests
  { search: "dev planning", expected: "Dev Planning", scenario: "case insensitive" },
  { search: "DEV PLANNING", expected: "Dev Planning", scenario: "uppercase input" },
  
  // Typo tolerance tests  
  { search: "dev planing", expected: "Dev Planning", scenario: "missing letter (typo)" },
  { search: "developement", expected: "Development", scenario: "extra letter (typo)" },
  { search: "planniing", expected: "Planning", scenario: "doubled letter (typo)" },
  
  // Partial matching tests
  { search: "dev plan", expected: "Dev Planning", scenario: "partial word match" },
  { search: "api dev", expected: "API Development", scenario: "partial multiple words" },
  
  // Turkish character tests
  { search: "içerik", expected: "İçerik Planlama", scenario: "Turkish character normalization" },
  { search: "geliştirme", expected: "Geliştirme Takibi", scenario: "Turkish word matching" },
  { search: "tasarim", expected: "UI Tasarım", scenario: "Turkish character to ASCII" },
  
  // Mixed language tests
  { search: "api geliştirme", expected: "API Geliştirme", scenario: "mixed English-Turkish" },
  { search: "ui tasarim", expected: "UI Tasarım", scenario: "mixed with Turkish chars" },
  
  // Word order tests
  { search: "planning dev", expected: "Dev Planning", scenario: "reversed word order" },
  
  // Edge cases
  { search: "xyz", expected: null, scenario: "no match expected" },
  { search: "", expected: null, scenario: "empty search" },
  { search: "d", expected: null, scenario: "too short" }
];

// Sample task titles for testing
const taskTitles = [
  "Dev Planning",
  "Development Setup", 
  "API Development",
  "UI Design",
  "UI Tasarım",
  "İçerik Planlama",
  "Geliştirme Takibi",
  "API Geliştirme",
  "Database Migration",
  "Code Review",
  "Testing Phase",
  "Planning Meeting"
];

console.log("🧪 Task Matching Algorithm Tests");
console.log("=================================");

// Simple matching function for testing (simplified version)
function simpleMatch(search, title) {
  if (!search || !title) return 0;
  
  const normalizeText = (text) => text.toLowerCase().trim().replace(/\s+/g, ' ');
  const turkishNormalize = (text) => {
    return text.toLowerCase()
      .replace(/[ığ]/g, 'i')
      .replace(/[ş]/g, 's')
      .replace(/[ç]/g, 'c')
      .replace(/[ü]/g, 'u')
      .replace(/[ö]/g, 'o');
  };
  
  const searchNorm = normalizeText(search);
  const titleNorm = normalizeText(title);
  const searchTurkish = turkishNormalize(search);
  const titleTurkish = turkishNormalize(title);
  
  // Exact match
  if (titleNorm === searchNorm) return 100;
  
  // Turkish normalized match  
  if (titleTurkish === searchTurkish) return 95;
  
  // Contains match
  if (titleNorm.includes(searchNorm) || searchNorm.includes(titleNorm)) {
    const coverage = Math.min(searchNorm.length, titleNorm.length) / Math.max(searchNorm.length, titleNorm.length);
    return Math.round(coverage * 85);
  }
  
  // Word-based fuzzy match (simplified)
  const searchWords = searchNorm.split(' ').filter(w => w.length > 1);
  const titleWords = titleNorm.split(' ').filter(w => w.length > 1);
  
  let matchingWords = 0;
  searchWords.forEach(sw => {
    titleWords.forEach(tw => {
      if (sw === tw || sw.includes(tw) || tw.includes(sw)) {
        matchingWords++;
      }
    });
  });
  
  if (matchingWords > 0) {
    const similarity = matchingWords / Math.max(searchWords.length, titleWords.length);
    return Math.round(similarity * 70);
  }
  
  return 0;
}

// Run tests
let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  const { search, expected, scenario } = testCase;
  
  // Find best match from task titles
  let bestMatch = null;
  let bestScore = 0;
  
  taskTitles.forEach(title => {
    const score = simpleMatch(search, title);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = title;
    }
  });
  
  // Determine if test passed
  const passed = (expected === null && bestScore < 60) || (bestMatch === expected);
  if (passed) passedTests++;
  
  // Output result
  const status = passed ? "✅ PASS" : "❌ FAIL";
  const confidence = bestScore > 0 ? `${bestScore}%` : "0%";
  
  console.log(`${status} Test ${index + 1}: ${scenario}`);
  console.log(`   Search: "${search}" → Found: "${bestMatch || 'none'}" (${confidence})`);
  
  if (!passed) {
    console.log(`   Expected: "${expected}"`);
  }
  console.log("");
});

console.log("=================================");
console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`);

if (passedTests === totalTests) {
  console.log("🎉 All tests passed! The fuzzy matching algorithm is working correctly.");
} else {
  console.log("⚠️  Some tests failed. The algorithm may need further refinement.");
}