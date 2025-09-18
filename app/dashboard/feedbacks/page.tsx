"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  Star,
  Calendar,
  User,
  MessageSquare,
  Image as ImageIcon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type FeedbackItem = {
  id: string;
  rating: number;
  authorName: string | null;
  profileImageUrl: string | null;
  comment: string | null;
  tags: string[];
  isConsentAccepted: boolean;
  photoUrls: string[];
  submittedAt: string;
  event: {
    id: string;
    slug: string;
    title: string;
  };
};

type FeedbackResponse = {
  feedbacks: FeedbackItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  events: Array<{
    id: string;
    slug: string;
    title: string;
    _count: { feedback: number };
  }>;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function FeedbacksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

  const { data, error, isLoading, mutate } = useSWR<FeedbackResponse>(
    `/api/feedbacks?page=${currentPage}&eventId=${selectedEvent === "all" ? "" : selectedEvent}`,
    fetcher
  );

  const filteredFeedbacks = useMemo(() => {
    if (!data?.feedbacks) return [];
    
    return data.feedbacks.filter((feedback) => {
      const matchesSearch = 
        feedback.authorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.event.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [data?.feedbacks, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
        }`}
      />
    ));
  };

  const exportFeedbacks = () => {
    if (!data?.feedbacks) return;
    
    const csvContent = [
      ["Date", "Event", "Rating", "Author", "Comment", "Photos"],
      ...data.feedbacks.map((feedback) => [
        formatDate(feedback.submittedAt),
        feedback.event.title,
        feedback.rating.toString(),
        feedback.authorName || "Anonymous",
        feedback.comment || "",
        feedback.photoUrls.length.toString(),
      ]),
    ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedbacks-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Feedbacks</h1>
        </div>
        <div className="text-sm text-muted-foreground">Loading feedbacks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Feedbacks</h1>
        </div>
        <div className="text-sm text-destructive">Failed to load feedbacks.</div>
      </div>
    );
  }

  const feedbacks = data?.feedbacks ?? [];
  const events = data?.events ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feedbacks</h1>
        <Button onClick={exportFeedbacks} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{data?.totalCount || 0}</div>
            <div className="text-sm text-muted-foreground">Total Feedbacks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {feedbacks.length > 0 
                ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
                : "0"
              }
            </div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {feedbacks.filter(f => f.comment).length}
            </div>
            <div className="text-sm text-muted-foreground">With Comments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {feedbacks.filter(f => f.photoUrls.length > 0).length}
            </div>
            <div className="text-sm text-muted-foreground">With Photos</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search feedbacks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by collector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Collectors</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title} ({event._count.feedback})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Feedbacks Table */}
      {filteredFeedbacks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchTerm || selectedEvent !== "all"
              ? "No feedbacks match your filters."
              : "No feedbacks yet."}
          </div>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Photos</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedbacks.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={feedback.profileImageUrl || ""} />
                        <AvatarFallback>
                          {feedback.authorName?.[0] || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {feedback.authorName || "Anonymous"}
                        </div>
                        {!feedback.isConsentAccepted && (
                          <Badge variant="outline" className="text-xs">
                            No consent
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{feedback.event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {feedback.event.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {renderStars(feedback.rating)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {feedback.comment ? (
                      <div className="max-w-[200px] truncate">
                        {feedback.comment}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No comment</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {feedback.photoUrls.length > 0 ? (
                      <Badge variant="secondary" className="gap-1">
                        <ImageIcon className="h-3 w-3" />
                        {feedback.photoUrls.length}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">No photos</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(feedback.submittedAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFeedback(feedback)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Feedback Details</DialogTitle>
                        </DialogHeader>
                        {selectedFeedback && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={selectedFeedback.profileImageUrl || ""} />
                                <AvatarFallback>
                                  {selectedFeedback.authorName?.[0] || "A"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {selectedFeedback.authorName || "Anonymous"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(selectedFeedback.submittedAt)}
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="font-medium mb-2">Event</div>
                              <div className="text-sm text-muted-foreground">
                                {selectedFeedback.event.title}
                              </div>
                            </div>

                            <div>
                              <div className="font-medium mb-2">Rating</div>
                              <div className="flex items-center gap-1">
                                {renderStars(selectedFeedback.rating)}
                                <span className="text-sm text-muted-foreground ml-2">
                                  {selectedFeedback.rating}/5
                                </span>
                              </div>
                            </div>

                            {selectedFeedback.comment && (
                              <div>
                                <div className="font-medium mb-2">Comment</div>
                                <div className="text-sm bg-muted p-3 rounded-md">
                                  {selectedFeedback.comment}
                                </div>
                              </div>
                            )}

                            {selectedFeedback.photoUrls.length > 0 && (
                              <div>
                                <div className="font-medium mb-2">Photos</div>
                                <div className="grid grid-cols-2 gap-2">
                                  {selectedFeedback.photoUrls.map((url, index) => (
                                    <img
                                      key={index}
                                      src={url}
                                      alt={`Photo ${index + 1}`}
                                      className="w-full h-32 object-cover rounded-md border"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <Badge variant={selectedFeedback.isConsentAccepted ? "default" : "outline"}>
                                {selectedFeedback.isConsentAccepted ? "Consent Given" : "No Consent"}
                              </Badge>
                              {selectedFeedback.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {selectedFeedback.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, data.totalCount)} of {data.totalCount} feedbacks
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === data.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
