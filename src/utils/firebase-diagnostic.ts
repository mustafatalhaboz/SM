import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { logger } from '@/lib/logger';

/**
 * Firebase Firestore permissions diagnostic tool
 * Tests basic CRUD operations to identify permission issues
 */
export class FirebaseDiagnostic {
  private testCollectionName = 'diagnostic_test';
  private testDocId = 'permission_test_doc';

  /**
   * Run comprehensive Firebase permissions test
   */
  async runDiagnostic(): Promise<DiagnosticResult> {
    const results: DiagnosticResult = {
      timestamp: new Date().toISOString(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'unknown',
      tests: {
        read: { success: false, error: null },
        write: { success: false, error: null },
        update: { success: false, error: null },
        delete: { success: false, error: null }
      },
      recommendations: []
    };

    logger.debug('Starting Firebase diagnostic tests');

    // Test 1: Read Operation
    try {
      const testDocRef = doc(db, this.testCollectionName, this.testDocId);
      await getDoc(testDocRef);
      results.tests.read.success = true;
      logger.debug('✅ Read test passed');
    } catch (error) {
      results.tests.read.error = this.getErrorMessage(error);
      logger.error('❌ Read test failed', { error });
    }

    // Test 2: Write Operation
    try {
      const testDocRef = doc(db, this.testCollectionName, this.testDocId);
      await setDoc(testDocRef, {
        testField: 'diagnostic test',
        timestamp: new Date(),
        purpose: 'permission testing'
      });
      results.tests.write.success = true;
      logger.debug('✅ Write test passed');
    } catch (error) {
      results.tests.write.error = this.getErrorMessage(error);
      logger.error('❌ Write test failed', { error });
    }

    // Test 3: Update Operation (the one failing in our app)
    if (results.tests.write.success) {
      try {
        const testDocRef = doc(db, this.testCollectionName, this.testDocId);
        await updateDoc(testDocRef, {
          testField: 'diagnostic test updated',
          lastUpdate: new Date()
        });
        results.tests.update.success = true;
        logger.debug('✅ Update test passed');
      } catch (error) {
        results.tests.update.error = this.getErrorMessage(error);
        logger.error('❌ Update test failed', { error });
      }
    }

    // Test 4: Delete Operation (cleanup)
    if (results.tests.write.success) {
      try {
        const testDocRef = doc(db, this.testCollectionName, this.testDocId);
        await deleteDoc(testDocRef);
        results.tests.delete.success = true;
        logger.debug('✅ Delete test passed');
      } catch (error) {
        results.tests.delete.error = this.getErrorMessage(error);
        logger.error('❌ Delete test failed', { error });
      }
    }

    // Generate recommendations
    results.recommendations = this.generateRecommendations(results);

    return results;
  }

  /**
   * Get user-friendly error message from Firebase error
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('permission-denied') || 
          error.message.includes('insufficient permissions')) {
        return 'Permission Denied: Firestore rules do not allow this operation';
      }
      if (error.message.includes('not-found')) {
        return 'Document or collection not found';
      }
      if (error.message.includes('invalid-argument')) {
        return 'Invalid data format or arguments';
      }
      return error.message;
    }
    return 'Unknown error occurred';
  }

  /**
   * Generate actionable recommendations based on test results
   */
  private generateRecommendations(results: DiagnosticResult): string[] {
    const recommendations: string[] = [];

    // Check for permission issues
    const hasPermissionErrors = Object.values(results.tests).some(test => 
      test.error?.includes('Permission Denied')
    );

    if (hasPermissionErrors) {
      recommendations.push(
        '🔐 Firebase Firestore rules need to be updated to allow read/write operations'
      );
      recommendations.push(
        '📝 Go to Firebase Console > Firestore Database > Rules and set to test mode'
      );
      recommendations.push(
        '⚙️ Use this rule for development: allow read, write: if true;'
      );
    }

    // Check for specific update issues
    if (!results.tests.update.success && results.tests.write.success) {
      recommendations.push(
        '🔄 Update operations are specifically blocked - check Firestore rules for update restrictions'
      );
    }

    // Check for complete access issues
    const allFailed = Object.values(results.tests).every(test => !test.success);
    if (allFailed) {
      recommendations.push(
        '🚨 Complete Firestore access blocked - check Firebase configuration and network'
      );
      recommendations.push(
        '🌐 Verify NEXT_PUBLIC_FIREBASE_* environment variables are correct'
      );
    }

    // Success case
    if (Object.values(results.tests).every(test => test.success)) {
      recommendations.push(
        '✅ All Firebase operations working correctly - no action needed'
      );
    }

    return recommendations;
  }

  /**
   * Run quick permission check for task operations
   */
  async checkTaskPermissions(): Promise<boolean> {
    try {
      // Try a simple write operation to test doc
      const testDoc = doc(db, 'tasks', 'permission_test_temp');
      await setDoc(testDoc, { test: true, timestamp: new Date() });
      
      // Try update operation (this is what's failing)
      await updateDoc(testDoc, { test: false, updated: new Date() });
      
      // Cleanup
      await deleteDoc(testDoc);
      
      return true;
    } catch (error) {
      logger.error('Task permissions check failed', { error });
      return false;
    }
  }
}

/**
 * Diagnostic result interface
 */
export interface DiagnosticResult {
  timestamp: string;
  projectId: string;
  tests: {
    read: TestResult;
    write: TestResult;
    update: TestResult;
    delete: TestResult;
  };
  recommendations: string[];
}

interface TestResult {
  success: boolean;
  error: string | null;
}

/**
 * Quick helper to run diagnostic from browser console
 */
export async function runFirebaseDiagnostic(): Promise<DiagnosticResult> {
  const diagnostic = new FirebaseDiagnostic();
  const result = await diagnostic.runDiagnostic();
  
  console.group('🔧 Firebase Diagnostic Results');
  console.log('Project ID:', result.projectId);
  console.log('Timestamp:', result.timestamp);
  
  console.group('📊 Test Results:');
  Object.entries(result.tests).forEach(([operation, result]) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${operation.toUpperCase()}:`, result.success ? 'PASS' : `FAIL - ${result.error}`);
  });
  console.groupEnd();
  
  if (result.recommendations.length > 0) {
    console.group('💡 Recommendations:');
    result.recommendations.forEach(rec => console.log(rec));
    console.groupEnd();
  }
  
  console.groupEnd();
  
  return result;
}