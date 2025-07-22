import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  author: string;
  authorRole: string;
  content: string;
  timestamp: Date;
  type: 'comment' | 'suggestion' | 'approval';
}

interface ChangeRecord {
  id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  user: string;
  userRole: string;
  timestamp: Date;
  description: string;
}

interface ApprovalRequest {
  id: string;
  type: 'creation' | 'modification' | 'deletion';
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  approver?: string;
  approvedAt?: Date;
  reason?: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  changes: {
    field: string;
    oldValue?: string;
    newValue: string;
  }[];
}

export function useCollaboration(flowId: string) {
  // Mock current user - in real app, this would come from auth context
  const currentUser = {
    name: "John Doe",
    role: "admin" as const,
  };

  // Mock data - in real app, this would come from API
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "Sarah Johnson",
      authorRole: "Editor",
      content: "This flow could be optimized by combining the first two actions into a single operation.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      type: "suggestion",
    },
    {
      id: "2",
      author: "Mike Chen",
      authorRole: "Admin",
      content: "Good catch! Let's implement that optimization.",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      type: "comment",
    },
  ]);

  const [changeHistory, setChangeHistory] = useState<ChangeRecord[]>([
    {
      id: "1",
      action: "Created",
      user: "Alice Smith",
      userRole: "Editor",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      description: "Initial flow creation",
    },
    {
      id: "2",
      action: "Updated",
      field: "trigger",
      oldValue: "Manual trigger",
      newValue: "Webhook trigger",
      user: "Bob Wilson",
      userRole: "Admin",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      description: "Changed trigger type to webhook for better automation",
    },
    {
      id: "3",
      action: "Approved",
      user: "Sarah Johnson",
      userRole: "Admin",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      description: "Approved optimization changes",
    },
  ]);

  const [approvalRequest, setApprovalRequest] = useState<ApprovalRequest | undefined>({
    id: "approval-1",
    type: "modification",
    requestedBy: "David Kim",
    requestedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    status: "pending",
    description: "Update flow to include error handling and retry logic",
    impact: "medium",
    changes: [
      {
        field: "Error Handling",
        newValue: "3 retries with exponential backoff",
      },
      {
        field: "Timeout",
        oldValue: "30 seconds",
        newValue: "60 seconds",
      },
    ],
  });

  const addComment = useCallback((content: string, type: 'comment' | 'suggestion') => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author: currentUser.name,
      authorRole: currentUser.role,
      content,
      timestamp: new Date(),
      type,
    };

    setComments(prev => [...prev, newComment]);
    
    toast({
      title: "Comment Added",
      description: `Your ${type} has been added to the flow.`,
    });
  }, [currentUser]);

  const addChangeRecord = useCallback((action: string, description: string, field?: string, oldValue?: string, newValue?: string) => {
    const newChange: ChangeRecord = {
      id: Date.now().toString(),
      action,
      field,
      oldValue,
      newValue,
      user: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date(),
      description,
    };

    setChangeHistory(prev => [newChange, ...prev]);
  }, [currentUser]);

  const approveRequest = useCallback((reason: string) => {
    if (approvalRequest) {
      setApprovalRequest({
        ...approvalRequest,
        status: 'approved',
        approver: currentUser.name,
        approvedAt: new Date(),
        reason,
      });

      addChangeRecord('Approved', `Request approved: ${approvalRequest.description}`);
      
      toast({
        title: "Request Approved",
        description: "The approval request has been approved successfully.",
      });
    }
  }, [approvalRequest, currentUser.name, addChangeRecord]);

  const rejectRequest = useCallback((reason: string) => {
    if (approvalRequest) {
      setApprovalRequest({
        ...approvalRequest,
        status: 'rejected',
        approver: currentUser.name,
        approvedAt: new Date(),
        reason,
      });

      addChangeRecord('Rejected', `Request rejected: ${reason}`);
      
      toast({
        title: "Request Rejected",
        description: "The approval request has been rejected.",
        variant: "destructive",
      });
    }
  }, [approvalRequest, currentUser.name, addChangeRecord]);

  const requestApproval = useCallback((description: string) => {
    const newRequest: ApprovalRequest = {
      id: Date.now().toString(),
      type: 'modification',
      requestedBy: currentUser.name,
      requestedAt: new Date(),
      status: 'pending',
      description,
      impact: 'medium', // This would be calculated based on the changes
      changes: [], // This would be populated with actual changes
    };

    setApprovalRequest(newRequest);
    
    toast({
      title: "Approval Requested",
      description: "Your request has been submitted for approval.",
    });
  }, [currentUser.name]);

  return {
    currentUser,
    comments,
    changeHistory,
    approvalRequest,
    addComment,
    addChangeRecord,
    approveRequest,
    rejectRequest,
    requestApproval,
  };
}