import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, User, Calendar } from "lucide-react";

interface Comment {
  id: string;
  author: string;
  authorRole: string;
  content: string;
  timestamp: Date;
  type: 'comment' | 'suggestion' | 'approval';
}

interface FlowCommentsProps {
  flowId: string;
  comments: Comment[];
  onAddComment: (content: string, type: 'comment' | 'suggestion') => void;
}

export function FlowComments({ flowId, comments, onAddComment }: FlowCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState<'comment' | 'suggestion'>('comment');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim(), commentType);
      setNewComment("");
    }
  };

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'suggestion': return 'bg-blue-100 text-blue-800';
      case 'approval': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comments & Collaboration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2 mb-2">
            <Button
              type="button"
              size="sm"
              variant={commentType === 'comment' ? 'default' : 'outline'}
              onClick={() => setCommentType('comment')}
            >
              Comment
            </Button>
            <Button
              type="button"
              size="sm"
              variant={commentType === 'suggestion' ? 'default' : 'outline'}
              onClick={() => setCommentType('suggestion')}
            >
              Suggestion
            </Button>
          </div>
          
          <Textarea
            placeholder={`Add a ${commentType}...`}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-20"
          />
          
          <Button type="submit" size="sm" disabled={!newComment.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Add {commentType.charAt(0).toUpperCase() + commentType.slice(1)}
          </Button>
        </form>

        {/* Comments List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No comments yet. Start the conversation!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {comment.author.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-sm font-medium">{comment.author}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {comment.authorRole}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getCommentTypeColor(comment.type)}`}>
                      {comment.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {comment.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-foreground">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}