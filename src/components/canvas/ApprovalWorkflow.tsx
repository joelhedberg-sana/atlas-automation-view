import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar,
  FileText 
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface ApprovalWorkflowProps {
  flowId: string;
  currentUser: {
    name: string;
    role: 'admin' | 'editor' | 'viewer';
  };
  approvalRequest?: ApprovalRequest;
  onApprove: (reason: string) => void;
  onReject: (reason: string) => void;
  onRequestApproval: (description: string) => void;
}

export function ApprovalWorkflow({
  flowId,
  currentUser,
  approvalRequest,
  onApprove,
  onReject,
  onRequestApproval,
}: ApprovalWorkflowProps) {
  const [approvalReason, setApprovalReason] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [requestDescription, setRequestDescription] = useState("");

  const canApprove = currentUser.role === 'admin' && approvalRequest?.status === 'pending';
  const needsApproval = approvalRequest && approvalRequest.status === 'pending';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Approval Workflow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Approval Request */}
        {approvalRequest ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(approvalRequest.status)}
                  <span className="font-medium">
                    {approvalRequest.type.charAt(0).toUpperCase() + approvalRequest.type.slice(1)} Request
                  </span>
                  <Badge className={`text-xs ${getImpactColor(approvalRequest.impact)}`}>
                    {approvalRequest.impact} impact
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {approvalRequest.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Requested by {approvalRequest.requestedBy}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {approvalRequest.requestedAt.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <Badge variant={
                approvalRequest.status === 'approved' ? 'default' : 
                approvalRequest.status === 'rejected' ? 'destructive' : 
                'secondary'
              }>
                {approvalRequest.status}
              </Badge>
            </div>

            {/* Changes Summary */}
            {approvalRequest.changes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Proposed Changes:</h4>
                <div className="bg-muted rounded-lg p-3 space-y-2">
                  {approvalRequest.changes.map((change, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{change.field}:</span>
                      {change.oldValue && (
                        <div className="text-red-600 ml-2">- {change.oldValue}</div>
                      )}
                      <div className="text-green-600 ml-2">+ {change.newValue}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approval Actions */}
            {canApprove && (
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default" size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Approve Request</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to approve this request? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                      placeholder="Optional approval reason..."
                      value={approvalReason}
                      onChange={(e) => setApprovalReason(e.target.value)}
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onApprove(approvalReason)}>
                        Approve
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject Request</AlertDialogTitle>
                      <AlertDialogDescription>
                        Please provide a reason for rejecting this request.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                      placeholder="Rejection reason (required)..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      required
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onReject(rejectionReason)}
                        disabled={!rejectionReason.trim()}
                      >
                        Reject
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {/* Approval Result */}
            {approvalRequest.status !== 'pending' && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  {getStatusIcon(approvalRequest.status)}
                  <span className="font-medium">
                    {approvalRequest.status === 'approved' ? 'Approved' : 'Rejected'} by {approvalRequest.approver}
                  </span>
                  <span className="text-muted-foreground">
                    on {approvalRequest.approvedAt?.toLocaleString()}
                  </span>
                </div>
                {approvalRequest.reason && (
                  <p className="text-sm text-muted-foreground mt-2">
                    "{approvalRequest.reason}"
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Request Approval Form */
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              High-impact changes require approval from an administrator.
            </p>
            
            <div className="space-y-3">
              <Textarea
                placeholder="Describe the changes you want to make and why they're needed..."
                value={requestDescription}
                onChange={(e) => setRequestDescription(e.target.value)}
                className="min-h-20"
              />
              
              <Button 
                onClick={() => onRequestApproval(requestDescription)}
                disabled={!requestDescription.trim()}
                size="sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Request Approval
              </Button>
            </div>
          </div>
        )}

        {/* User Role Info */}
        <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
          Your role: <Badge variant="outline" className="text-xs">{currentUser.role}</Badge>
          {currentUser.role === 'viewer' && (
            <span className="ml-2">You can view but not modify flows.</span>
          )}
          {currentUser.role === 'editor' && (
            <span className="ml-2">You can edit flows, but high-impact changes need approval.</span>
          )}
          {currentUser.role === 'admin' && (
            <span className="ml-2">You can approve/reject requests and make any changes.</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}