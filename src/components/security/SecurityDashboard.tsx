import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useSecurity } from '@/hooks/useSecurity';
import { Shield, Lock, Eye, Download, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export function SecurityDashboard() {
  const { toast } = useToast();
  const {
    securityEvents,
    auditLogs,
    userSessions,
    gdprRequests,
    loading,
    requestDataExport,
    requestDataDeletion,
    revokeSession,
    fetchSecurityEvents,
    fetchAuditLogs,
    fetchUserSessions,
    fetchGDPRRequests
  } = useSecurity();

  useEffect(() => {
    fetchSecurityEvents();
    fetchAuditLogs();
    fetchUserSessions();
    fetchGDPRRequests();
  }, []);

  const handleDataExport = async () => {
    try {
      await requestDataExport();
      toast({
        title: "Data Export Requested",
        description: "Your data export request has been submitted. You'll receive an email when it's ready.",
      });
      fetchGDPRRequests();
    } catch (error) {
      toast({
        title: "Failed to Request Export",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDataDeletion = async () => {
    if (!confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
      return;
    }

    try {
      await requestDataDeletion();
      toast({
        title: "Data Deletion Requested",
        description: "Your data deletion request has been submitted and will be processed within 30 days.",
      });
      fetchGDPRRequests();
    } catch (error) {
      toast({
        title: "Failed to Request Deletion",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      toast({
        title: "Session Revoked",
        description: "The session has been successfully revoked.",
      });
      fetchUserSessions();
    } catch (error) {
      toast({
        title: "Failed to Revoke Session",
        description: "There was an error revoking the session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'failed_login':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'account_locked':
        return <Lock className="h-4 w-4 text-warning" />;
      default:
        return <Shield className="h-4 w-4 text-primary" />;
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'failed_login':
        return 'destructive';
      case 'account_locked':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Security Dashboard</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Events</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityEvents.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total security events recorded
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userSessions.filter(s => s.is_active).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Audit Logs</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditLogs.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total audit log entries
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Security Activity</CardTitle>
              <CardDescription>
                Latest security events and audit logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getEventTypeIcon(log.event_type)}
                      <div>
                        <p className="font-medium">{log.event_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(log.created_at), 'PPp')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getEventTypeColor(log.event_type)}>
                      {log.event_type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>
                Failed login attempts and security incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getEventTypeIcon(event.event_type)}
                      <div>
                        <p className="font-medium">{event.event_type}</p>
                        <p className="text-sm text-muted-foreground">
                          Email: {event.email} | IP: {event.ip_address?.toString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.created_at), 'PPp')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Attempts: {event.attempt_count}
                      </Badge>
                      {event.locked_until && (
                        <Badge variant="destructive">
                          Locked until {format(new Date(event.locked_until), 'PPp')}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {securityEvents.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No security events recorded
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                Complete audit trail of all system activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getEventTypeIcon(log.event_type)}
                      <div>
                        <p className="font-medium">{log.event_type}</p>
                        <p className="text-sm text-muted-foreground">
                          Session: {log.session_id} | IP: {log.ip_address?.toString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(log.created_at), 'PPp')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {log.event_type}
                    </Badge>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No audit logs recorded
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Sessions</CardTitle>
              <CardDescription>
                Manage your active and inactive sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Eye className="h-4 w-4" />
                      <div>
                        <p className="font-medium">
                          Session {session.session_token.slice(0, 8)}...
                        </p>
                        <p className="text-sm text-muted-foreground">
                          IP: {session.ip_address?.toString()} | Last activity: {format(new Date(session.last_activity), 'PPp')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires: {format(new Date(session.expires_at), 'PPp')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={session.is_active ? 'default' : 'secondary'}>
                        {session.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {session.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {userSessions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No sessions found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Privacy</CardTitle>
              <CardDescription>
                Manage your data and privacy settings under GDPR compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  You have the right to request a copy of your data or request its deletion.
                  These requests will be processed within 30 days as required by GDPR.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export Your Data
                    </CardTitle>
                    <CardDescription>
                      Download a complete copy of your personal data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleDataExport} className="w-full">
                      Request Data Export
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Your Data
                    </CardTitle>
                    <CardDescription>
                      Permanently delete all your personal data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleDataDeletion} 
                      variant="destructive" 
                      className="w-full"
                    >
                      Request Data Deletion
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>GDPR Requests</CardTitle>
                  <CardDescription>
                    Track the status of your data requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gdprRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {request.request_type === 'data_export' ? 
                            <Download className="h-4 w-4" /> : 
                            <Trash2 className="h-4 w-4" />
                          }
                          <div>
                            <p className="font-medium">
                              {request.request_type === 'data_export' ? 'Data Export' : 
                               request.request_type === 'data_deletion' ? 'Data Deletion' : 
                               'Consent Withdrawal'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Requested: {format(new Date(request.created_at), 'PPp')}
                            </p>
                            {request.expires_at && (
                              <p className="text-sm text-muted-foreground">
                                Expires: {format(new Date(request.expires_at), 'PPp')}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant={
                            request.status === 'completed' ? 'default' : 
                            request.status === 'processing' ? 'secondary' : 
                            'outline'
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                    {gdprRequests.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No data requests submitted
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}