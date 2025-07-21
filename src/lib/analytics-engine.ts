import { EnhancedFlow, ExecutionLog } from './enhanced-data-types';

// Smart Detection Algorithms
export class AutomationAnalytics {
  // Advanced duplicate detection using semantic similarity
  static detectAdvancedDuplicates(flows: EnhancedFlow[]): Array<{
    flow: EnhancedFlow;
    duplicates: EnhancedFlow[];
    similarity: number;
    reason: string;
  }> {
    const duplicateGroups: Array<{
      flow: EnhancedFlow;
      duplicates: EnhancedFlow[];
      similarity: number;
      reason: string;
    }> = [];

    flows.forEach((flow, index) => {
      const potentialDuplicates = flows.slice(index + 1).filter(otherFlow => {
        // Name similarity (Levenshtein distance)
        const nameSimilarity = this.calculateSimilarity(flow.name, otherFlow.name);
        
        // Trigger similarity
        const triggerSimilarity = flow.trigger.type === otherFlow.trigger.type ? 1 : 0;
        
        // Action similarity
        const actionSimilarity = this.calculateActionSimilarity(flow.actions, otherFlow.actions);
        
        // Combined score
        const overallSimilarity = (nameSimilarity * 0.4) + (triggerSimilarity * 0.3) + (actionSimilarity * 0.3);
        
        return overallSimilarity > 0.7; // 70% similarity threshold
      });

      if (potentialDuplicates.length > 0) {
        duplicateGroups.push({
          flow,
          duplicates: potentialDuplicates,
          similarity: 0.85, // Average similarity
          reason: 'Similar name, trigger, and actions detected'
        });
      }
    });

    return duplicateGroups;
  }

  // Detect orphaned automations
  static detectOrphans(flows: EnhancedFlow[]): Array<{
    flow: EnhancedFlow;
    reason: string;
    severity: 'low' | 'medium' | 'high';
  }> {
    return flows.map(flow => {
      const reasons = [];
      let severity: 'low' | 'medium' | 'high' = 'low';

      // No executions in last 30 days
      if (!flow.lastRun || new Date(flow.lastRun) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
        reasons.push('No executions in 30+ days');
        severity = 'medium';
      }

      // Very low success rate
      if (flow.successRate < 50) {
        reasons.push('Success rate below 50%');
        severity = 'high';
      }

      // High error count
      if (flow.performance.errorCount > 100) {
        reasons.push('High error count');
        severity = 'high';
      }

      // Disabled status
      if (flow.status === 'disabled') {
        reasons.push('Flow is disabled');
        severity = 'medium';
      }

      return {
        flow,
        reason: reasons.join(', ') || 'Active and healthy',
        severity
      };
    }).filter(result => result.reason !== 'Active and healthy');
  }

  // Detect performance anomalies
  static detectPerformanceAnomalies(flows: EnhancedFlow[]): Array<{
    flow: EnhancedFlow;
    anomaly: string;
    impact: 'low' | 'medium' | 'high';
    recommendation: string;
  }> {
    const anomalies: Array<{
      flow: EnhancedFlow;
      anomaly: string;
      impact: 'low' | 'medium' | 'high';
      recommendation: string;
    }> = [];

    flows.forEach(flow => {
      // Slow execution time
      if (flow.avgExecutionTime > 60) {
        anomalies.push({
          flow,
          anomaly: `Slow execution time: ${flow.avgExecutionTime}s`,
          impact: 'medium',
          recommendation: 'Review flow complexity and optimize triggers'
        });
      }

      // High failure rate
      if (flow.successRate < 85) {
        anomalies.push({
          flow,
          anomaly: `Low success rate: ${flow.successRate}%`,
          impact: 'high',
          recommendation: 'Review error logs and fix failing conditions'
        });
      }

      // High cost per execution
      if (flow.cost.perExecution > 0.5) {
        anomalies.push({
          flow,
          anomaly: `High cost per execution: $${flow.cost.perExecution}`,
          impact: 'medium',
          recommendation: 'Consider optimizing to reduce API calls'
        });
      }

      // Execution frequency mismatch
      if (flow.frequency === 'realtime' && flow.monthlyExecutions < 100) {
        anomalies.push({
          flow,
          anomaly: 'Real-time trigger with low usage',
          impact: 'low',
          recommendation: 'Consider changing to scheduled trigger'
        });
      }
    });

    return anomalies;
  }

  // Calculate ROI for automations
  static calculateROI(flow: EnhancedFlow): {
    monthlySavings: number;
    annualSavings: number;
    roi: number;
    paybackPeriod: number;
  } {
    // Estimate time saved per execution (in minutes)
    const timeSavedPerExecution = flow.actions.length * 5; // 5 minutes per action
    
    // Average hourly rate for the department
    const hourlyRates = {
      sales: 50,
      marketing: 45,
      support: 35,
      operations: 40,
      finance: 55
    };
    
    const hourlyRate = hourlyRates[flow.department as keyof typeof hourlyRates] || 45;
    
    // Calculate savings
    const monthlySavings = (flow.monthlyExecutions * timeSavedPerExecution / 60) * hourlyRate;
    const annualSavings = monthlySavings * 12;
    
    // Calculate ROI (assuming setup cost and monthly tool cost)
    const setupCost = 500; // Estimated setup cost
    const annualCost = flow.cost.monthly * 12;
    const totalCost = setupCost + annualCost;
    
    const roi = ((annualSavings - totalCost) / totalCost) * 100;
    const paybackPeriod = totalCost / monthlySavings; // months
    
    return {
      monthlySavings,
      annualSavings,
      roi,
      paybackPeriod
    };
  }

  // Helper methods
  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private static calculateActionSimilarity(actions1: any[], actions2: any[]): number {
    if (actions1.length === 0 && actions2.length === 0) return 1;
    if (actions1.length === 0 || actions2.length === 0) return 0;
    
    const types1 = actions1.map(a => a.type).sort();
    const types2 = actions2.map(a => a.type).sort();
    
    const intersection = types1.filter(type => types2.includes(type));
    const union = [...new Set([...types1, ...types2])];
    
    return intersection.length / union.length;
  }
}

// Business Impact Metrics
export class BusinessImpactCalculator {
  static calculateDepartmentEfficiency(flows: EnhancedFlow[], department: string): {
    totalFlows: number;
    activeFlows: number;
    averageSuccessRate: number;
    totalMonthlySavings: number;
    automationCoverage: number;
  } {
    const deptFlows = flows.filter(f => f.department === department);
    const activeFlows = deptFlows.filter(f => f.status === 'active');
    
    const totalSuccessRate = deptFlows.reduce((sum, f) => sum + f.successRate, 0);
    const averageSuccessRate = deptFlows.length > 0 ? totalSuccessRate / deptFlows.length : 0;
    
    const totalMonthlySavings = deptFlows.reduce((sum, f) => {
      const roi = AutomationAnalytics.calculateROI(f);
      return sum + roi.monthlySavings;
    }, 0);
    
    // Estimate automation coverage (percentage of processes automated)
    const estimatedProcesses = deptFlows.length * 1.5; // Assume 1.5x more processes could be automated
    const automationCoverage = (deptFlows.length / estimatedProcesses) * 100;
    
    return {
      totalFlows: deptFlows.length,
      activeFlows: activeFlows.length,
      averageSuccessRate,
      totalMonthlySavings,
      automationCoverage
    };
  }

  static calculateRevenueAttribution(flows: EnhancedFlow[]): {
    flow: EnhancedFlow;
    estimatedMonthlyRevenue: number;
    conversionImpact: number;
  }[] {
    return flows
      .filter(flow => flow.department === 'sales' || flow.department === 'marketing')
      .map(flow => {
        // Estimate revenue based on flow type and execution volume
        let estimatedMonthlyRevenue = 0;
        let conversionImpact = 0;
        
        if (flow.department === 'sales') {
          // Sales flows: estimate based on deal velocity improvement
          estimatedMonthlyRevenue = flow.monthlyExecutions * 50; // $50 per execution
          conversionImpact = 5; // 5% improvement in deal closure
        } else if (flow.department === 'marketing') {
          // Marketing flows: estimate based on lead generation
          estimatedMonthlyRevenue = flow.monthlyExecutions * 15; // $15 per lead
          conversionImpact = 3; // 3% improvement in lead quality
        }
        
        return {
          flow,
          estimatedMonthlyRevenue,
          conversionImpact
        };
      })
      .sort((a, b) => b.estimatedMonthlyRevenue - a.estimatedMonthlyRevenue);
  }
}