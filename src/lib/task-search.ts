import { Task, TaskWithProject } from '@/lib/types';
import { TaskIdentification } from '@/types/agent';
import { logger } from '@/lib/logger';

/**
 * Match confidence details
 */
export interface MatchConfidence {
  score: number; // 0-100 confidence score
  type: 'exact' | 'case-insensitive' | 'typo-corrected' | 'partial' | 'fuzzy';
  reasons: string[];
}

/**
 * Task search result with enhanced confidence scoring
 */
export interface TaskSearchResult {
  task: Task;
  projectName: string;
  confidence: number; // 0-100 confidence score (updated from 0-1)
  matchType: 'exact' | 'case-insensitive' | 'typo-corrected' | 'partial' | 'fuzzy';
  matchDetails?: MatchConfidence;
}

/**
 * Search result with multiple matches for disambiguation
 */
export interface TaskSearchResults {
  matches: TaskSearchResult[];
  exactMatch?: TaskSearchResult;
  needsDisambiguation: boolean;
}

/**
 * Searches for tasks by project and task name with fuzzy matching
 */
export function searchTasksByName(
  allTasks: TaskWithProject[],
  identification: TaskIdentification
): TaskSearchResults {
  
  const { projectName, taskName } = identification;
  
  logger.debug('Task search: Starting search', {
    projectName,
    taskName,
    totalTasks: allTasks.length
  } as Record<string, unknown>);
  
  // Filter by project first
  const projectTasks = allTasks.filter(task => 
    normalizeText(task.projectName) === normalizeText(projectName) ||
    task.projectName.toLowerCase().includes(projectName.toLowerCase()) ||
    projectName.toLowerCase().includes(task.projectName.toLowerCase())
  );
  
  if (projectTasks.length === 0) {
    logger.debug('Task search: No tasks found for project', { projectName } as Record<string, unknown>);
    return { matches: [], needsDisambiguation: false };
  }
  
  logger.debug('Task search: Project tasks found', {
    projectName,
    projectTaskCount: projectTasks.length
  } as Record<string, unknown>);
  
  const matches: TaskSearchResult[] = [];
  
  for (const task of projectTasks) {
    const matchResult = calculateTaskMatch(taskName, task.title);
    
    if (matchResult && matchResult.score >= CONFIDENCE_THRESHOLDS.EXCLUDE) {
      matches.push({
        task,
        projectName: task.projectName,
        confidence: matchResult.score,
        matchType: matchResult.type,
        matchDetails: matchResult
      });
    }
  }
  
  // Sort by confidence (highest first)
  matches.sort((a, b) => b.confidence - a.confidence);
  
  // Find high-confidence matches (90%+)
  const highConfidenceMatch = matches.find(m => m.confidence >= CONFIDENCE_THRESHOLDS.AUTO_ACCEPT);
  
  // Determine if disambiguation is needed
  const needsDisambiguation = !highConfidenceMatch && matches.length > 1 && 
                              (matches[0]?.confidence ?? 0) < CONFIDENCE_THRESHOLDS.AUTO_ACCEPT;
  
  logger.debug('Task search: Search completed', {
    projectName,
    taskName,
    matchesFound: matches.length,
    highConfidenceMatch: !!highConfidenceMatch,
    needsDisambiguation,
    topMatch: matches[0] ? {
      title: matches[0].task.title,
      confidence: matches[0].confidence,
      matchType: matches[0].matchType,
      reasons: matches[0].matchDetails?.reasons
    } : null
  } as Record<string, unknown>);
  
  return {
    matches: matches.slice(0, 5), // Limit to top 5 matches
    ...(highConfidenceMatch && { exactMatch: highConfidenceMatch }),
    needsDisambiguation
  };
}

// Confidence thresholds
export const CONFIDENCE_THRESHOLDS = {
  AUTO_ACCEPT: 90,        // Auto-accept matches above this threshold
  NEEDS_CONFIRMATION: 60, // Ask user confirmation between this and AUTO_ACCEPT
  SHOW_SUGGESTIONS: 40,   // Show in disambiguation list above this threshold
  EXCLUDE: 40             // Exclude matches below this threshold
} as const;

/**
 * Turkish character mappings for normalization
 */
const TURKISH_CHAR_MAP: Record<string, string> = {
  'ı': 'i', 'İ': 'i', 'I': 'i',
  'ğ': 'g', 'Ğ': 'g',
  'ü': 'u', 'Ü': 'u',
  'ş': 's', 'Ş': 's',
  'ö': 'o', 'Ö': 'o',
  'ç': 'c', 'Ç': 'c'
};

/**
 * Normalizes text for comparison with Turkish character support
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, ''); // Remove punctuation
}

/**
 * Normalizes text with Turkish character mapping
 */
function normalizeTextTurkish(text: string): string {
  let normalized = text.toLowerCase().trim();
  
  // Replace Turkish characters with their ASCII equivalents
  for (const [turkish, ascii] of Object.entries(TURKISH_CHAR_MAP)) {
    normalized = normalized.replace(new RegExp(turkish, 'g'), ascii);
  }
  
  return normalized
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '');
}

/**
 * Calculates Levenshtein distance between two strings
 */
function calculateLevenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [];
    matrix[i]![0] = i;
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0]![j] = j;
  }

  // Calculate distances
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,        // deletion
        matrix[i]![j - 1]! + 1,        // insertion
        matrix[i - 1]![j - 1]! + cost  // substitution
      );
    }
  }

  return matrix[len1]![len2]!;
}

/**
 * Comprehensive task matching with multiple algorithms and confidence scoring
 */
function calculateTaskMatch(searchTerm: string, taskTitle: string): MatchConfidence | null {
  const reasons: string[] = [];
  
  // Normalize both strings for comparison
  const normalizedSearch = normalizeText(searchTerm);
  const normalizedTask = normalizeText(taskTitle);
  const turkishNormalizedSearch = normalizeTextTurkish(searchTerm);
  const turkishNormalizedTask = normalizeTextTurkish(taskTitle);
  
  // 1. Exact match (100% confidence)
  if (normalizedTask === normalizedSearch) {
    return {
      score: 100,
      type: 'exact',
      reasons: ['Exact match']
    };
  }
  
  // 2. Case-insensitive exact match (95% confidence)
  if (taskTitle.toLowerCase().trim() === searchTerm.toLowerCase().trim()) {
    return {
      score: 95,
      type: 'case-insensitive',
      reasons: ['Case-insensitive exact match']
    };
  }
  
  // 3. Turkish character normalization match (95% confidence)
  if (turkishNormalizedTask === turkishNormalizedSearch) {
    return {
      score: 95,
      type: 'case-insensitive',
      reasons: ['Turkish character normalized match']
    };
  }
  
  // 4. Levenshtein distance-based matching (typo tolerance)
  const levenshteinDistance = calculateLevenshteinDistance(normalizedSearch, normalizedTask);
  const maxLength = Math.max(normalizedSearch.length, normalizedTask.length);
  
  if (levenshteinDistance <= 2 && maxLength > 3) {
    const similarity = ((maxLength - levenshteinDistance) / maxLength) * 100;
    const confidence = levenshteinDistance === 1 ? 90 : 80;
    
    reasons.push(`Typo correction (${levenshteinDistance} character${levenshteinDistance > 1 ? 's' : ''} different)`);
    
    return {
      score: Math.min(confidence, similarity),
      type: 'typo-corrected',
      reasons
    };
  }
  
  // 5. Turkish Levenshtein distance
  const turkishLevenshteinDistance = calculateLevenshteinDistance(turkishNormalizedSearch, turkishNormalizedTask);
  if (turkishLevenshteinDistance <= 2 && maxLength > 3) {
    const similarity = ((maxLength - turkishLevenshteinDistance) / maxLength) * 100;
    const confidence = turkishLevenshteinDistance === 1 ? 90 : 80;
    
    reasons.push(`Turkish typo correction (${turkishLevenshteinDistance} character${turkishLevenshteinDistance > 1 ? 's' : ''} different)`);
    
    return {
      score: Math.min(confidence, similarity),
      type: 'typo-corrected',
      reasons
    };
  }
  
  // 6. Partial match - one string contains the other
  if (normalizedTask.includes(normalizedSearch) || normalizedSearch.includes(normalizedTask)) {
    const coverage = Math.min(normalizedSearch.length, normalizedTask.length) / 
                    Math.max(normalizedSearch.length, normalizedTask.length);
    const confidence = Math.round(coverage * 85); // Max 85% for partial matches
    
    reasons.push('Partial text match');
    
    if (confidence >= CONFIDENCE_THRESHOLDS.EXCLUDE) {
      return {
        score: confidence,
        type: 'partial',
        reasons
      };
    }
  }
  
  // 7. Word-based fuzzy matching
  const fuzzyScore = calculateEnhancedWordSimilarity(normalizedSearch, normalizedTask);
  if (fuzzyScore >= 0.5) { // 50% word similarity threshold
    const confidence = Math.round(fuzzyScore * 70); // Max 70% for fuzzy matches
    
    reasons.push(`Word similarity (${Math.round(fuzzyScore * 100)}% word overlap)`);
    
    return {
      score: confidence,
      type: 'fuzzy',
      reasons
    };
  }
  
  // No match found
  return null;
}

/**
 * Enhanced word-based similarity calculation
 */
function calculateEnhancedWordSimilarity(text1: string, text2: string): number {
  const words1 = text1.split(' ').filter(w => w.length > 1); // Ignore single characters
  const words2 = text2.split(' ').filter(w => w.length > 1);
  
  if (words1.length === 0 || words2.length === 0) {
    return 0;
  }
  
  let matchingWords = 0;
  const matchedWords = new Set<string>();
  
  // First pass: exact word matches
  for (const word1 of words1) {
    if (words2.includes(word1) && !matchedWords.has(word1)) {
      matchingWords += 1;
      matchedWords.add(word1);
    }
  }
  
  // Second pass: partial word matches (one word contains another)
  for (const word1 of words1) {
    if (matchedWords.has(word1)) continue;
    
    for (const word2 of words2) {
      if (matchedWords.has(word2)) continue;
      
      if ((word1.length > 3 && word2.includes(word1)) || 
          (word2.length > 3 && word1.includes(word2))) {
        matchingWords += 0.8; // Partial match is worth less
        matchedWords.add(word1);
        matchedWords.add(word2);
        break;
      }
    }
  }
  
  // Third pass: Levenshtein distance for remaining words (typos)
  for (const word1 of words1) {
    if (matchedWords.has(word1)) continue;
    
    for (const word2 of words2) {
      if (matchedWords.has(word2)) continue;
      
      if (word1.length > 2 && word2.length > 2) {
        const distance = calculateLevenshteinDistance(word1, word2);
        const maxLen = Math.max(word1.length, word2.length);
        
        if (distance <= 2 && distance / maxLen <= 0.4) { // Max 40% character difference
          matchingWords += 0.6; // Typo match is worth even less
          matchedWords.add(word1);
          matchedWords.add(word2);
          break;
        }
      }
    }
  }
  
  // Calculate Jaccard-like similarity
  const totalWords = Math.max(words1.length, words2.length);
  return matchingWords / totalWords;
}

/**
 * Gets the best match from search results based on confidence thresholds
 */
export function getBestTaskMatch(searchResults: TaskSearchResults): TaskSearchResult | null {
  if (searchResults.matches.length === 0) {
    return null;
  }
  
  const topMatch = searchResults.matches[0];
  
  // Auto-accept if confidence is high enough
  if (topMatch && topMatch.confidence >= CONFIDENCE_THRESHOLDS.AUTO_ACCEPT) {
    return topMatch;
  }
  
  // Single match with medium confidence - let caller decide if they want to confirm
  if (searchResults.matches.length === 1 && 
      topMatch && 
      topMatch.confidence >= CONFIDENCE_THRESHOLDS.NEEDS_CONFIRMATION) {
    return topMatch;
  }
  
  // Multiple matches - check if one is significantly better
  if (searchResults.matches.length > 1 && topMatch) {
    const secondMatch = searchResults.matches[1];
    
    // If top match is much better and above confirmation threshold, return it
    if (secondMatch && 
        topMatch.confidence >= CONFIDENCE_THRESHOLDS.NEEDS_CONFIRMATION &&
        topMatch.confidence - secondMatch.confidence >= 20) { // 20 point difference
      return topMatch;
    }
  }
  
  return null; // Needs disambiguation
}

/**
 * Determines if search results need user confirmation
 */
export function needsUserConfirmation(searchResults: TaskSearchResults): boolean {
  if (searchResults.matches.length === 0) {
    return false;
  }
  
  const topMatch = searchResults.matches[0];
  
  // High confidence matches don't need confirmation
  if (topMatch && topMatch.confidence >= CONFIDENCE_THRESHOLDS.AUTO_ACCEPT) {
    return false;
  }
  
  // Medium confidence matches need confirmation
  if (topMatch && 
      topMatch.confidence >= CONFIDENCE_THRESHOLDS.NEEDS_CONFIRMATION && 
      topMatch.confidence < CONFIDENCE_THRESHOLDS.AUTO_ACCEPT) {
    return true;
  }
  
  return false;
}

/**
 * Gets confirmation prompt for a single uncertain match
 */
export function createConfirmationPrompt(match: TaskSearchResult): string {
  const confidenceText = `${match.confidence}% eşleşme`;
  const reasonText = match.matchDetails?.reasons?.join(', ') || 'Benzer görev';
  
  return `"${match.task.title}" görevini kastettiğinizi mi?\n\nProje: ${match.projectName}\nGüven: ${confidenceText}\nNeden: ${reasonText}`;
}

/**
 * Creates enhanced disambiguation text with confidence details
 */
export function createDisambiguationText(matches: TaskSearchResult[]): string {
  if (matches.length === 0) {
    return 'Görev bulunamadı. Lütfen farklı kelimeler deneyin veya yeni görev oluşturun.';
  }
  
  const matchTexts = matches.slice(0, 4).map((match, index) => {
    const confidenceText = `${match.confidence}% eşleşme`;
    const reasonText = match.matchDetails?.reasons?.[0] || '';
    const status = match.task.status !== 'Yapıldı' ? ` [${match.task.status}]` : ' [Tamamlandı]';
    
    return `${index + 1}. "${match.task.title}"${status}\n   Proje: ${match.projectName} | ${confidenceText}\n   ${reasonText}`;
  });
  
  return `Birden fazla görev bulundu:\n\n${matchTexts.join('\n\n')}\n\nLütfen daha spesifik bir görev adı belirtin.`;
}

/**
 * Creates suggestion text when no good matches are found
 */
export function createSuggestionText(matches: TaskSearchResult[], searchTerm: string): string {
  if (matches.length === 0) {
    return `"${searchTerm}" ile eşleşen görev bulunamadı.\n\nYeni görev oluşturmak ister misiniz?`;
  }
  
  const suggestions = matches.slice(0, 3).map((match, index) => {
    const confidenceText = `${match.confidence}% benzer`;
    return `${index + 1}. "${match.task.title}" (${match.projectName}) - ${confidenceText}`;
  });
  
  return `"${searchTerm}" ile tam eşleşme bulunamadı.\n\nBenzer görevler:\n${suggestions.join('\n')}\n\nBunlardan birini mi kastettiniz?`;
}